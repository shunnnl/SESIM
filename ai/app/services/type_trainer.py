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

    def _auto_label_attacks(self, df: pd.DataFrame) -> pd.DataFrame:
        """자동 라벨링: 패턴 기반으로 공격 유형 추론"""
        
        # TLS 프로브 패턴
        tls_patterns = [r'\\x16\\x03', r'%5cx16%5cx03', r'tls.*handshake', r'ssl.*handshake']
        
        # Command Injection 패턴
        cmd_patterns = [
            r'[;&|`$]', r'\|\|', r'&&', r'\$\(',
            r'\b(rm|cat|ls|pwd|whoami|id|uname|ps|wget|curl|nc|bash|sh)\s',
            r'\b(cmd|powershell|dir|type|copy|del|tasklist|ipconfig|net)\s',
            r'(cmd|command|exec|shell|system)='
        ]
        
        # SSRF/RFI 패턴
        ssrf_patterns = [
            r'(file|https?|ftp|gopher|dict|ldap)://.*(?:localhost|127\.0\.0\.1|0\.0\.0\.0|169\.254\.169\.254)',
            r'metadata', r'169\.254\.169\.254',
            r'(url|proxy|redirect|path|file|src|target|uri)=.*(?:file:|https?://)',
            r'(include|require|page|template|view|content)=.*(?:https?://|ftp://)'
        ]
        
        # Directory Traversal 패턴
        dt_patterns = [
            r'(\.\./)+', r'\.\.[\\/]', r'%2e%2e[\\/]', r'%252e%252e[\\/]',
            r'(etc\/passwd|etc\/shadow|etc\/hosts|web\.config|wp-config\.php|\.env|config\.php)'
        ]
        
        # Code Injection 패턴  
        code_patterns = [
            r'<\?php', r'eval\s*\(', r'system\s*\(', r'exec\s*\(', r'passthru\s*\(',
            r'shell_exec\s*\(', r'file_get_contents\s*\(', r'base64_decode\s*\(',
            r'assert\s*\(', r'create_function\s*\('
        ]
        
        # XSS 패턴
        xss_patterns = [
            r'<script', r'<svg', r'<img', r'<iframe', r'javascript:', r'vbscript:',
            r'on\w+\s*=', r'alert\s*\(', r'document\.(write|writeln)', r'eval\s*\('
        ]
        
        # SQL Injection 패턴
        sqli_patterns = [
            r"'.*--", r"'.*#", r"'.*=", r"1\s*=\s*1", r"union\s+select",
            r"drop\s+table", r"delete\s+from", r"information_schema",
            r"sleep\s*\(", r"benchmark\s*\(", r"concat\s*\("
        ]

        def match_patterns(text: str, patterns: list) -> bool:
            if pd.isna(text):
                return False
            text_lower = str(text).lower()
            return any(re.search(pattern, text_lower, re.I) for pattern in patterns)

        # 자동 라벨링 적용
        for idx, row in df.iterrows():
            if pd.notna(row[TYPE_COL]) and row[TYPE_COL].strip():
                continue  # 이미 라벨이 있으면 건너뛰기
            
            url = str(row[URL]) if pd.notna(row[URL]) else ""
            ua = str(row[UA]) if pd.notna(row[UA]) else ""
            combined_text = f"{url} {ua}"
            
            # 우선순위대로 검사 (더 구체적인 공격부터)
            if match_patterns(combined_text, tls_patterns):
                df.at[idx, TYPE_COL] = "tls_probe"
            elif match_patterns(combined_text, code_patterns):
                df.at[idx, TYPE_COL] = "code_injection"
            elif match_patterns(combined_text, cmd_patterns):
                df.at[idx, TYPE_COL] = "command_injection"
            elif match_patterns(combined_text, dt_patterns):
                df.at[idx, TYPE_COL] = "directory_traversal"
            elif match_patterns(combined_text, ssrf_patterns):
                df.at[idx, TYPE_COL] = "ssrf_rfi"
            elif match_patterns(combined_text, xss_patterns):
                df.at[idx, TYPE_COL] = "xss"
            elif match_patterns(combined_text, sqli_patterns):
                df.at[idx, TYPE_COL] = "sql_injection"
                
        return df

    def train(self, csv: str | Path) -> Dict[str, str]:
        df = pd.read_csv(csv)

        df["is_attack"] = df["is_attack"].fillna(False)
        df = df[df["is_attack"] == True]
        
        if df.empty:
            logger.warning("공격 데이터가 없어 유형 학습을 건너뜁니다.")
            return {"status": "skipped", "reason": "no attack data"}

        # ① 라벨 전처리 및 자동 라벨링
        df[TYPE_COL] = df[TYPE_COL].fillna("").str.strip().str.lower()
        
        # 자동 라벨링 적용
        df = self._auto_label_attacks(df)
        
        # 빈 라벨이나 'normal' 라벨 제거
        df = df[df[TYPE_COL].ne("") & df[TYPE_COL].ne("normal")]
        if df.empty:
            logger.warning("공격 유형 라벨이 없어 유형 학습을 건너뜁니다.")
            return {"status": "skipped", "reason": "no attack type labels"}

        # 라벨 정규화
        label_mapping = {
            "cmd_injection": "command_injection",
            "rce": "command_injection", 
            "remote_code_execution": "command_injection",
            "path_traversal": "directory_traversal",
            "lfi": "directory_traversal",
            "local_file_inclusion": "directory_traversal",
            "rfi": "ssrf_rfi",
            "remote_file_inclusion": "ssrf_rfi",
            "server_side_request_forgery": "ssrf_rfi",
            "cross_site_scripting": "xss",
            "sqli": "sql_injection",
            "sql_inj": "sql_injection",
        }
        
        df[TYPE_COL] = df[TYPE_COL].replace(label_mapping)

        # 피처 추출
        X_txt  = self.vec.transform(df[URL].fillna(""))
        X_ptrn = sparse.csr_matrix(
            extract_url_features(df)[PATTERN_COLS].values.astype("float32"))

        xm = df[METHOD].apply(self.enc_m.transform).values
        xa = df[UA].apply(self.enc_a.transform).values
        xs = pd.to_numeric(df[STATUS], errors="coerce").fillna(200).astype(int).values
        X_meta = sparse.csr_matrix(np.stack([xs, xm, xa], 1).astype("float32"))

        X = sparse.hstack([X_txt, X_ptrn, X_meta])
        
        # 라벨 인코딩
        le = LabelEncoder()
        y = le.fit_transform(df[TYPE_COL])
        
        # 클래스별 샘플 수 확인
        unique_labels, counts = np.unique(y, return_counts=True)
        class_distribution = dict(zip(le.inverse_transform(unique_labels), counts))
        logger.info(f"클래스 분포: {class_distribution}")

        # 클래스 불균형 보정 (최소 클래스 크기 조정)
        min_samples = max(10, min(counts))  # 최소 10개 샘플 보장
        
        try:
            # 샘플링 전략: 소수 클래스를 적절히 증강
            sampling_strategy = {
                cls: max(count, min_samples * 2) 
                for cls, count in zip(unique_labels, counts)
            }
            
            X_bal, y_bal = RandomOverSampler(
                random_state=42, 
                sampling_strategy=sampling_strategy
            ).fit_resample(X, y)
            
            logger.info(f"샘플링 후 크기: {X_bal.shape[0]} (원본: {X.shape[0]})")
            
        except Exception as e:
            logger.warning(f"샘플링 실패, 원본 데이터 사용: {e}")
            X_bal, y_bal = X, y

        # 학습
        n_classes = len(unique_labels)
        clf = XGBClassifier(
            objective="multi:softprob",
            num_class=n_classes,
            n_estimators=min(300, max(100, len(X_bal) // 10)),
            max_depth=min(8, max(4, int(np.log2(len(X_bal))))),
            learning_rate=0.15,
            subsample=0.9,
            colsample_bytree=0.9,
            tree_method="hist",
            n_jobs=-1,
            random_state=42,
            early_stopping_rounds=10,
            eval_metric="mlogloss"
        ).fit(X_bal, y_bal, eval_set=[(X_bal, y_bal)], verbose=False)

        # 저장
        joblib.dump(clf, self.dir / "xgb_type_clf.pkl")
        joblib.dump(le, self.dir / "label_encoder.pkl")

        # 메타 정보 갱신
        meta_path = self.dir / "meta.json"
        meta = json.loads(meta_path.read_text())
        meta["type_classes"] = sorted(set(df[TYPE_COL]))
        meta["class_distribution"] = class_distribution
        meta["auto_labeled_count"] = len(df) - len(df[df[TYPE_COL].isin(["", "normal"])])
        meta_path.write_text(json.dumps(meta, indent=2))

        logger.info(f"[TYPE] 모델 저장 → {self.dir}")
        logger.info(f"학습된 클래스: {meta['type_classes']}")
        
        return {
            "status": "ok", 
            "classes": meta['type_classes'],
            "class_distribution": class_distribution,
            "auto_labeled_count": meta["auto_labeled_count"]
        }