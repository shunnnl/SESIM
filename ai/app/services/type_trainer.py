from __future__ import annotations

import joblib, json, logging, re
from pathlib import Path
from typing import Dict

import pandas as pd, numpy as np
from scipy import sparse
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from imblearn.over_sampling import RandomOverSampler

from app.core.config   import MODEL_DIR
from app.utils         import extract_url_features, PATTERN_COLS

logger = logging.getLogger(__name__)

URL, METHOD, UA, STATUS = "url", "method", "user_agent", "status_code"
TYPE_COL = "attack_type"

class AttackTypeTrainer:
    def __init__(self, version: str):
        self.version = version
        self.dir     = MODEL_DIR / f"model_v{version}"

        # Stage-1 아티팩트 로드
        self.vec   = joblib.load(self.dir / "vectorizer.pkl")
        self.enc_m = joblib.load(self.dir / "method_encoder.pkl")
        self.enc_a = joblib.load(self.dir / "agent_encoder.pkl")


    def train(self, csv: str | Path) -> Dict[str, str]:
        df = pd.read_csv(csv)
        
        # is_attack이 null인 경우 필터링 추가
        df["is_attack"] = df["is_attack"].fillna(False)
        # 공격 데이터만 필터링 (True인 경우만)
        df = df[df["is_attack"] == True]
        
        if df.empty:
            logger.warning("공격 데이터가 없어 유형 학습을 건너뜁니다.")
            return {"status": "skipped", "reason": "no attack data"}

        # ① 라벨 전처리
        df[TYPE_COL] = df[TYPE_COL].fillna("").str.strip().str.lower()
        
        # 코드 인젝션 클래스 추가 - PHP 관련 패턴이 있으면 코드 인젝션으로 변환
        php_patterns = [r'<\?php', r'eval\(', r'system\(', r'exec\(', r'passthru\(', r'shell_exec\(']
        
        # 기존 라벨이 있고 PHP 패턴이 있는 경우 code_injection으로 변환
        for idx, row in df.iterrows():
            if pd.isna(row[TYPE_COL]) or row[TYPE_COL] == "":
                continue
                
            url = row[URL].lower() if pd.notna(row[URL]) else ""
            
            # PHP 패턴이 있으면 code_injection으로 설정
            if any(re.search(pattern, url) for pattern in php_patterns):
                df.at[idx, TYPE_COL] = "code_injection"
        
        # 기존 로직 계속 진행
        df = df[df[TYPE_COL].ne("") & df[TYPE_COL].ne("normal")]
        if df.empty:
            logger.warning("공격 유형 라벨이 없어 유형 학습을 건너뜁니다.")
            return {"status": "skipped", "reason": "no attack type labels"}

        # ② 피처
        X_txt  = self.vec.transform(df[URL].fillna(""))
        X_ptrn = sparse.csr_matrix(
            extract_url_features(df)[PATTERN_COLS].values.astype("float32"))

        xm = df[METHOD].apply(self.enc_m.transform).values
        xa = df[UA].apply(self.enc_a.transform).values
        xs = pd.to_numeric(df[STATUS], errors="coerce").fillna(200).astype(int).values
        X_meta = sparse.csr_matrix(np.stack([xs, xm, xa], 1).astype("float32"))

        X = sparse.hstack([X_txt, X_ptrn, X_meta])
        y = LabelEncoder().fit_transform(df[TYPE_COL])

        # ③ 클래스 불균형 보정
        X_bal, y_bal = RandomOverSampler(random_state=42).fit_resample(X, y)

        # ④ 학습
        clf = XGBClassifier(
            objective="multi:softprob",
            num_class=len(set(y)),
            n_estimators=250,
            max_depth=6,
            learning_rate=0.2,
            tree_method="hist",
            n_jobs=-1,
        ).fit(X_bal, y_bal)

        # ⑤ 저장
        joblib.dump(clf, self.dir / "xgb_type_clf.pkl")
        joblib.dump(LabelEncoder().fit(df[TYPE_COL]),  self.dir / "label_encoder.pkl")

        # 메타 정보 갱신
        meta_path = self.dir / "meta.json"
        meta = json.loads(meta_path.read_text())
        meta["type_classes"] = sorted(set(df[TYPE_COL]))
        meta_path.write_text(json.dumps(meta, indent=2))

        logger.info(f"[TYPE] 모델 저장 → {self.dir}")
        return {"status": "ok", "classes": meta['type_classes']}