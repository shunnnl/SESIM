from typing import List, Dict
import joblib

class SafeEncoder:

    UNK_TOKEN = "<UNK>"

    def __init__(self, known_values: List[str]):
        self.known = list(known_values)
        if self.UNK_TOKEN not in self.known:
            self.known.append(self.UNK_TOKEN)
        self.lookup: Dict[str, int] = {v: i for i, v in enumerate(self.known)}

    def transform(self, value: str) -> int:
        return self.lookup.get(value, self.lookup[self.UNK_TOKEN])

    def save(self, path):
        joblib.dump(self, path)

    @staticmethod
    def load(path):
        return joblib.load(path)
