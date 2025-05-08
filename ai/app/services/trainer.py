from __future__ import annotations

import json
import joblib
import logging
import numpy as np
import pandas as pd
from pathlib import Path
from xgboost import XGBClassifier
from sklearn.utils import resample
from app.core.encoder import SafeEncoder
from typing import Any, Dict, List, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from app.core.config import ( DATA_DIR, MODEL_DIR, TRAINING_HISTORY_DIR,
                            FULL_RETRAIN_CYCLE, RETENTION_RATIO )


logger = logging.getLogger(__name__)

URL_COL = "url"
TARGET_COL = "is_attack"
REQUIRED_COLS = {URL_COL, "method", "user_agent", "status_code", TARGET_COL}

HISTORY_CHUNK_ROWS = 1_000_000


# ---------------------------------------------------------------------------
#                           History helpers
# ---------------------------------------------------------------------------
def _read_history(max_rows: Optional[int] = None) -> pd.DataFrame:
    if not TRAINING_HISTORY_DIR.exists():
        return pd.DataFrame()

    frames: List[pd.DataFrame] = []
    total = 0
    for csv_file in sorted(TRAINING_HISTORY_DIR.glob("*.csv")):
        try:
            df = pd.read_csv(csv_file)
            frames.append(df)
            total += len(df)
            if max_rows and total >= max_rows:
                break
        except Exception as e:
            logger.warning(f"히스토리 로드 실패({csv_file.name}): {e}")

    if not frames:
        return pd.DataFrame()
    all_df = pd.concat(frames, ignore_index=True)
    if max_rows and len(all_df) > max_rows:
        all_df = all_df.sample(n=max_rows, random_state=42).reset_index(drop=True)
    return all_df


def _append_history(df: pd.DataFrame) -> None:
    TRAINING_HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    fname = f"hist_{pd.Timestamp.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    df.to_csv(TRAINING_HISTORY_DIR / fname, index=False)


# ---------------------------------------------------------------------------
#                               Trainer
# ---------------------------------------------------------------------------
class ModelTrainer:
    """증분 학습 + 완전 재학습 관리"""

    def __init__(self, model_version: str) -> None:
        self.v = model_version
        self.dir = MODEL_DIR / f"model_v{self.v}"
        self.meta_path = self.dir / "meta.json"

        self.model: Optional[xgb.Booster] = None
        self.vec: Optional[TfidfVectorizer] = None
        self.enc_method: Optional[SafeEncoder] = None
        self.enc_agent: Optional[SafeEncoder] = None

    # ----------------------------- public ----------------------------- #
    def train(self, new_df: pd.DataFrame, force_full: bool = False) -> Dict[str, Any]:
        new_df = self._preprocess(new_df)

        if force_full or not self._load_bundle():
            logger.info("[TRAIN] full retrain (no previous model / forced)")
            self._reset_counter()
            result = self._full_retrain(new_df)
        else:
            counter = self._incr_counter()
            if counter >= FULL_RETRAIN_CYCLE:
                logger.info("[TRAIN] cycle reached → full retrain")
                self._reset_counter()
                result = self._full_retrain(new_df)
            else:
                logger.info(f"[TRAIN] incremental step {counter}/{FULL_RETRAIN_CYCLE-1}")
                result = self._incremental_train(new_df)

        _append_history(new_df)
        return result

    # ---------------------------- pipeline ---------------------------- #
    def _preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        if missing := REQUIRED_COLS - set(df.columns):
            raise RuntimeError(f"필수 컬럼 누락: {missing}")

        df = df.copy()
        df[URL_COL] = df[URL_COL].fillna(" ")
        df["method"] = df["method"].fillna("GET")
        df["user_agent"] = df["user_agent"].fillna(" ")
        df["status_code"] = pd.to_numeric(df["status_code"], errors="coerce").fillna(200).astype(int)
        df[TARGET_COL] = df[TARGET_COL].astype(bool)
        return df

    def _vectorize(self, df: pd.DataFrame, fit: bool) -> Tuple[np.ndarray, np.ndarray]:
        if fit or self.vec is None:
            self.vec = TfidfVectorizer(max_features=10_000, ngram_range=(1, 2))
            X_text = self.vec.fit_transform(df[URL_COL])
        else:
            X_text = self.vec.transform(df[URL_COL])

        if fit or self.enc_method is None:
            self.enc_method = SafeEncoder(df["method"].unique().tolist())
            self.enc_agent = SafeEncoder(df["user_agent"].unique().tolist())

        self.enc_method.update(df["method"].unique().tolist())
        self.enc_agent.update(df["user_agent"].unique().tolist())

        X_other = pd.DataFrame(
            {
                "status_code": df["status_code"],
                "m_enc": df["method"].apply(self.enc_method.transform),
                "a_enc": df["user_agent"].apply(self.enc_agent.transform),
            }
        )
        X = np.hstack([X_text.toarray(), X_other.values]).astype("float32")
        y = df[TARGET_COL].astype(int).values
        return X, y

    # --------------------------- training ----------------------------- #
    def _full_retrain(self, new_df: pd.DataFrame) -> Dict[str, Any]:
        hist_df = _read_history(int(RETENTION_RATIO * len(new_df)))
        combined = pd.concat([hist_df, new_df], ignore_index=True).drop_duplicates(
            subset=[URL_COL, "method", "status_code"]
        )

        df_bal, cls_w = self._balance(combined)
        X, y = self._vectorize(df_bal, fit=True)

        self.model = XGBClassifier(**self._xgb_params(), n_estimators=300)
        self.model.fit(X, y, sample_weight=self._weights(y, cls_w))

        y_hat = self.model.predict(X)
        acc = float((y_hat == y).mean())
        self._save_bundle()
        return {"accuracy": acc, "version": self.v, "type": "full"}

    def _incremental_train(self, new_df: pd.DataFrame) -> Dict[str, Any]:
        mem_df = _read_history(int(RETENTION_RATIO * len(new_df)))
        df = pd.concat([mem_df, new_df], ignore_index=True).drop_duplicates(
            subset=[URL_COL, "method", "status_code"]
        )

        df_bal, cls_w = self._balance(df)
        X, y = self._vectorize(df_bal, fit=False)

        prev = self.model
        clf = XGBClassifier(**prev.get_params())
        clf.fit(X, y,
                sample_weight=self._weights(y, cls_w),
                xgb_model=prev.get_booster())
        self.model = clf

        acc = float(((self.model.predict(dtrain) > 0.5).astype(int) == y).mean())
        self._save_bundle()
        return {"accuracy": acc, "version": self.v, "type": "incremental"}

    # ------------------------- imbalance ----------------------------- #
    @staticmethod
    def _balance(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[int, float] | None]:
        counts = df[TARGET_COL].value_counts()
        if len(counts) < 2:
            return df, None

        maj_cls = counts.idxmax()
        min_cls = counts.idxmin()
        maj, minc = counts[maj_cls], counts[min_cls]
        if minc / maj < 0.5:
            up = resample(
                df[df[TARGET_COL] == min_cls],
                replace=True,
                n_samples=maj - minc,
                random_state=42,
            )
            df = pd.concat([df, up], ignore_index=True)

        counts = df[TARGET_COL].value_counts()
        weights = {0: counts.sum() / counts[0], 1: counts.sum() / counts[1]}
        return df, weights

    @staticmethod
    def _weights(y: np.ndarray, cls_w: Dict[int, float] | None) -> Optional[np.ndarray]:
        if not cls_w:
            return None
        return np.array([cls_w[int(i)] for i in y], dtype="float32")

    # ---------------------------- utils ------------------------------ #
    @staticmethod
    def _xgb_params() -> Dict[str, Any]:
        return {
            "objective": "binary:logistic",
            "max_depth": 7,
            "learning_rate": 0.15,
            "subsample": 0.9,
            "colsample_bytree": 0.9,
            "n_jobs": -1,
        }

    # ------------------------- bundle I/O ---------------------------- #
    def _load_bundle(self) -> bool:
        model_p = self.dir / f"xgboost_nginx_model_v{self.v}.pkl"
        if not model_p.exists():
            return False

        try:
            self.model = joblib.load(model_p)
            self.vec = joblib.load(self.dir / f"tfidf_vectorizer_v{self.v}.pkl")
            self.enc_method = joblib.load(self.dir / f"method_encoder_v{self.v}.pkl")
            self.enc_agent = joblib.load(self.dir / f"agent_encoder_v{self.v}.pkl")
            return True
        except Exception as e:
            logger.warning(f"모델 번들 로드 실패 → 재학습 진행: {e}")
            return False

    def _save_bundle(self) -> None:
        self.dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, self.dir / f"xgboost_nginx_model_v{self.v}.pkl")
        joblib.dump(self.vec, self.dir / f"tfidf_vectorizer_v{self.v}.pkl")
        joblib.dump(self.enc_method, self.dir / f"method_encoder_v{self.v}.pkl")
        joblib.dump(self.enc_agent, self.dir / f"agent_encoder_v{self.v}.pkl")
        current = self._load_meta().get("incr_count", 0)
        self._write_meta({"incr_count": current})

    # -------------------------- counter ------------------------------ #
    def _incr_counter(self) -> int:
        meta = self._load_meta()
        cnt = meta.get("incr_count", 0) + 1
        meta["incr_count"] = cnt
        self._write_meta(meta)
        return cnt

    def _reset_counter(self) -> None:
        self._write_meta({"incr_count": 0})

    # --------------------------- meta I/O ---------------------------- #
    def _load_meta(self) -> Dict[str, Any]:
        if not self.meta_path.exists():
            return {}
        try:
            return json.loads(self.meta_path.read_text())
        except Exception:
            return {}

    def _write_meta(self, meta: Dict[str, Any]) -> None:
        self.meta_path.parent.mkdir(parents=True, exist_ok=True)
        self.meta_path.write_text(json.dumps(meta, indent=2))


# ---------------------------------------------------------------------------
#                       module‑level convenience API
# ---------------------------------------------------------------------------
def robust_incremental_training(
    csv_path: Path, model_dir: Path, model_version: str, force_full_retrain: bool = False
) -> Dict[str, Any]:
    df = pd.read_csv(csv_path)
    trainer = ModelTrainer(model_version)
    trainer.dir = model_dir
    trainer.meta_path = trainer.dir / "meta.json"
    return trainer.train(df, force_full=force_full_retrain)