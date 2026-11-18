"""
DropOrCop - External Real-Life Dataset Evaluation Script
Group G - End-Semester Assessment
Validates trained models/best_model.joblib against real-world test data in /home/antara/Documents/Test.
"""

import os
import sys
from pathlib import Path
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

TEST_DIR = Path("/home/antara/Documents/Test")
MODEL_PATH = Path("models/best_model.joblib")


def run_evaluation():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)

    dataset_2023_path = TEST_DIR / "sneakers2023.csv"
    if not dataset_2023_path.exists():
        dataset_2023_path = TEST_DIR / "archive(3)" / "sneakers2023.csv"

    print("=" * 70)
    print("👟 DropOrCop: Real-Life External Dataset Accuracy & Robustness Test")
    print(f"Dataset: {dataset_2023_path}")
    print("=" * 70)

    df = pd.read_csv(dataset_2023_path)
    df["release_dt"] = pd.to_datetime(df["release"], errors="coerce")
    ref_date = pd.to_datetime("2023-03-22")
    df["days_since_release"] = (ref_date - df["release_dt"]).dt.days.fillna(0).clip(lower=0)

    def map_brand(row):
        item = str(row["item"]).lower()
        brand = str(row["brand"]).strip()
        if "yeezy" in item:
            return "Yeezy"
        elif "off-white" in item or brand.lower() == "off-white":
            return "Off-White"
        return brand

    df["mapped_brand"] = df.apply(map_brand, axis=1)
    df["shoe_size"] = 10.0

    slices = [
        ("Yeezy & Off-White (In-Domain)", df[df["mapped_brand"].isin(["Yeezy", "Off-White"]) & (df["retail"] > 0)]),
        ("Yeezy Core MSRP $200+ (350s/700s)", df[(df["mapped_brand"] == "Yeezy") & (df["retail"] >= 200)]),
        ("Yeezy Slides & Foam RNR ($60-$80)", df[(df["mapped_brand"] == "Yeezy") & (df["retail"] < 100) & (df["retail"] > 0)]),
        ("All 2,000 Sneakers (Market-wide)", df[df["retail"] > 0]),
    ]

    for label, subset in slices:
        X = subset[["mapped_brand", "retail", "shoe_size", "days_since_release", "item"]].rename(
            columns={"mapped_brand": "brand", "retail": "retail_price", "item": "sneaker_name"}
        )
        y_true = subset["averageDeadstockPrice"].astype(float)
        retail = subset["retail"].astype(float)
        y_pred = model.predict(X)

        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mape = mean_absolute_percentage_error(y_true, y_pred) * 100
        r2 = r2_score(y_true, y_pred)

        cop_true_0 = y_true > retail
        cop_pred_0 = y_pred > retail
        acc_0 = (cop_true_0 == cop_pred_0).mean() * 100

        cop_true_15 = (y_true - retail) / retail >= 0.15
        cop_pred_15 = (y_pred - retail) / retail >= 0.15
        acc_15 = (cop_true_15 == cop_pred_15).mean() * 100

        print(f"\n▶ Slice: {label} (N = {len(subset)})")
        print(f"  • COP/DROP Directional Accuracy (0% Margin)  : {acc_0:.2f}%")
        print(f"  • COP/DROP Directional Accuracy (15% Margin) : {acc_15:.2f}%")
        print(f"  • Mean Absolute Error (MAE)                  : ${mae:.2f}")
        print(f"  • Root Mean Squared Error (RMSE)             : ${rmse:.2f}")
        print(f"  • Mean Absolute Percentage Error (MAPE)      : {mape:.2f}%")
        print(f"  • R² Score                                   : {r2:.4f}")


if __name__ == "__main__":
    run_evaluation()
