"""
DropOrCop - Sneaker Feature Extraction Transformer
Group G - End-Semester Assessment
Extracts silhouette and hype indicators from sneaker names and brands.
"""

from sklearn.base import BaseEstimator, TransformerMixin
import pandas as pd


class SneakerFeatureExtractor(BaseEstimator, TransformerMixin):
    """Extracts silhouette and hype tier indicator features from sneaker metadata."""

    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_out = X.copy()
        if not isinstance(X_out, pd.DataFrame):
            X_out = pd.DataFrame(X_out)

        if "sneaker_name" in X_out.columns:
            text = (
                X_out["sneaker_name"].fillna("").astype(str)
                + " "
                + X_out["brand"].fillna("").astype(str)
            ).str.lower()
        elif "item" in X_out.columns:
            text = (
                X_out["item"].fillna("").astype(str)
                + " "
                + X_out["brand"].fillna("").astype(str)
            ).str.lower()
        else:
            text = X_out["brand"].fillna("").astype(str).str.lower()

        X_out["is_high_hype"] = text.str.contains(
            r"sb|travis|tiffany|off-white|slide|foam|panda|reimagined|union|sacai|fragment|chicago|clot|lobster|cactus|supreme|born x raised|jarritos",
            regex=True,
        ).astype(int)
        X_out["is_retro"] = text.str.contains(r"retro|og", regex=True).astype(int)
        X_out["is_dunk"] = text.str.contains(r"dunk", regex=True).astype(int)
        X_out["is_jordan4"] = text.str.contains(r"jordan 4|jordan-4", regex=True).astype(int)
        X_out["is_jordan1"] = text.str.contains(r"jordan 1|jordan-1", regex=True).astype(int)
        X_out["is_runner"] = text.str.contains(r"air max|vapor|presto|zoom", regex=True).astype(int)
        X_out["is_general_blazer"] = text.str.contains(r"blazer mid|blazer low", regex=True).astype(int)

        # Drop raw text columns if present so preprocessor only sees clean features
        cols_to_drop = [c for c in ["sneaker_name", "item"] if c in X_out.columns]
        if cols_to_drop:
            X_out = X_out.drop(columns=cols_to_drop)

        return X_out
