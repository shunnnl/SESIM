from typing import List, Dict, Set, Optional, Tuple
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

class UnifiedEncoder:
    """통합 인코더 - 모든 범주형 변수를 하나로 관리"""
    UNK_TOKEN = "<UNK>"

    def __init__(self, allow_updates: bool = True):
        self.method_encoder = SafeEncoder([], allow_updates)
        self.agent_encoder = SafeEncoder([], allow_updates) 
        self.type_label_encoder = LabelEncoder()
        self.allow_updates = allow_updates
        self._frozen = False
        self._type_fitted = False

    def fit_method_agent(self, methods: List[str], agents: List[str]):
        """HTTP 메소드와 User-Agent 인코더 학습"""
        if not self._frozen:
            self.method_encoder.fit_transform(methods)
            self.agent_encoder.fit_transform(agents)

    def fit_attack_types(self, attack_types: List[str]):
        """공격 유형 라벨 인코더 학습"""
        if not self._frozen and attack_types:
            # null이나 빈 값 제거
            valid_types = [t for t in attack_types if t and str(t).strip()]
            if valid_types:
                self.type_label_encoder.fit(valid_types)
                self._type_fitted = True

    def transform_method_agent(self, methods: List[str], agents: List[str]) -> Tuple[np.ndarray, np.ndarray]:
        """메소드와 에이전트 변환"""
        m_encoded = np.array([self.method_encoder.transform(m) for m in methods])
        a_encoded = np.array([self.agent_encoder.transform(a) for a in agents])
        return m_encoded, a_encoded

    def transform_attack_types(self, attack_types: List[str]) -> Optional[np.ndarray]:
        """공격 유형 변환"""
        if not self._type_fitted:
            return None
        
        # 알려진 클래스만 변환, 나머지는 -1
        result = []
        for attack_type in attack_types:
            if attack_type in self.type_label_encoder.classes_:
                result.append(self.type_label_encoder.transform([attack_type])[0])
            else:
                result.append(-1)  # 알 수 없는 클래스
        return np.array(result)

    def inverse_transform_attack_types(self, encoded_types: np.ndarray) -> List[str]:
        """공격 유형 역변환"""
        if not self._type_fitted:
            return ["unknown"] * len(encoded_types)
        
        result = []
        for enc_type in encoded_types:
            if 0 <= enc_type < len(self.type_label_encoder.classes_):
                result.append(self.type_label_encoder.inverse_transform([enc_type])[0])
            else:
                result.append("unknown")
        return result

    def get_attack_type_classes(self) -> List[str]:
        """공격 유형 클래스 목록 반환"""
        if self._type_fitted:
            return list(self.type_label_encoder.classes_)
        return []

    def freeze(self):
        """인코더 고정"""
        self._frozen = True
        self.method_encoder.freeze()
        self.agent_encoder.freeze()

    def unfreeze(self):
        """인코더 고정 해제"""
        if self.allow_updates:
            self._frozen = False
            self.method_encoder.unfreeze()
            self.agent_encoder.unfreeze()

    def save(self, path):
        """통합 인코더 저장"""
        joblib.dump(self, path)

    @staticmethod
    def load(path) -> 'UnifiedEncoder':
        """통합 인코더 로드"""
        return joblib.load(path)


class SafeEncoder:
    """개별 인코더 (기존 유지)"""
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