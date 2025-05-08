from typing import List, Dict, Set
import joblib

class SafeEncoder:
    UNK_TOKEN = "<UNK>"

    def __init__(self, known_values: List[str], allow_updates: bool = True):
        self.known = list(known_values)
        if self.UNK_TOKEN not in self.known:
            self.known.append(self.UNK_TOKEN)
        self.lookup: Dict[str, int] = {v: i for i, v in enumerate(self.known)}
        self.allow_updates = allow_updates
        self._frozen = False

    def transform(self, value: str) -> int:
        return self.lookup.get(value, self.lookup[self.UNK_TOKEN])
    
    def fit_transform(self, values: List[str]) -> List[int]:
        if self._frozen or not self.allow_updates:
            return [self.transform(v) for v in values]
        
        result = []
        new_values: Set[str] = set()
        
        for v in values:
            if v not in self.lookup and v != self.UNK_TOKEN:
                new_values.add(v)
        
        if new_values:
            start_idx = len(self.known)
            self.known.extend(new_values)
            for i, v in enumerate(new_values, start=start_idx):
                self.lookup[v] = i
        
        for v in values:
            result.append(self.transform(v))
            
        return result
    
    def update(self, new_values: List[str]) -> int:
        if self._frozen or not self.allow_updates:
            return 0
            
        added = 0
        for v in new_values:
            if v not in self.lookup and v != self.UNK_TOKEN:
                self.lookup[v] = len(self.known)
                self.known.append(v)
                added += 1
                
        return added
    
    def freeze(self):
        self._frozen = True
    
    def unfreeze(self):
        if self.allow_updates:
            self._frozen = False
    
    def save(self, path):
        joblib.dump(self, path)

    @staticmethod
    def load(path) -> 'SafeEncoder':
        return joblib.load(path)
    
    @staticmethod
    def merge(encoders: List['SafeEncoder']) -> 'SafeEncoder':
        all_values = set()
        for encoder in encoders:
            all_values.update(encoder.known)
        
        if SafeEncoder.UNK_TOKEN in all_values:
            all_values.remove(SafeEncoder.UNK_TOKEN)
            
        return SafeEncoder(list(all_values))