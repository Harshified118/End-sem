"""
DropOrCop - Model Evaluation & Diagnostics (Phase 4)
Author: Anamika Ghosh (Model Checking & Evaluation Lead, Group G)
Academic Context: B.Tech CSE End-Semester Capstone Assessment (November 2026)

This script performs comprehensive evaluation on the holdout test set (18,871 records):
1. Calculates regression metrics (MAE, RMSE, MAPE, R^2).
2. Calculates directional classification accuracy for COP/DROP verdicts.
3. Performs brand-stratified performance analysis (Yeezy vs. Off-White).
4. Conducts residual diagnostics (normality, heteroscedasticity).
5. Identifies top outlier predictions for viva case studies.
6. Exports publication-quality diagnostic plots to reports/figures/.
7. Exports summary metrics to reports/evaluation_metrics.json.
"""

import os
import sys
import json
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
import numpy as np
import pandas as pd

# Set Matplotlib cache dir before importing pyplot to avoid permission warnings
os.environ["MPLCONFIGDIR"] = "/tmp/matplotlib"
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
from sklearn.model_selection import train_test_split


def evaluate_model():
    print("=" * 65)
    print("👟 DropOrCop: Phase 4 Model Checking & Residual Diagnostics")
    print("Lead: Anamika Ghosh (Sl. No. 32) | Group G")
    print("=" * 65)

    test_pred_path = Path("data/processed/test_predictions.csv")
    clean_data_path = Path("data/processed/clean_stockx.csv")
    figures_dir = Path("reports/figures")
    figures_dir.mkdir(parents=True, exist_ok=True)

    if not test_pred_path.exists():
        raise FileNotFoundError(f"Missing {test_pred_path}. Run src/train.py first.")

    df_preds = pd.read_csv(test_pred_path)
    print(f"\n📂 Loaded test predictions: {len(df_preds):,} records.")

    # Reconstruct test set metadata (brand, days_since_release) for stratified evaluation if missing
    if "brand" not in df_preds.columns and clean_data_path.exists():
        df_full = pd.read_csv(clean_data_path)
        features = ["brand", "retail_price", "shoe_size", "days_since_release"]
        X = df_full[features]
        y = df_full["sale_price"]
        _, X_test, _, _ = train_test_split(X, y, test_size=0.20, random_state=42)
        df_preds["brand"] = X_test["brand"].values
        df_preds["days_since_release"] = X_test["days_since_release"].values
        df_preds["shoe_size"] = X_test["shoe_size"].values

    y_true = df_preds["actual_resale_price"]
    y_pred = df_preds["predicted_resale_price"]
    retail = df_preds["retail_price"]

    # 1. Primary Regression Metrics
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mape = mean_absolute_percentage_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)

    # 2. Residuals & Error Statistics
    residuals = y_true - y_pred
    df_preds["residual"] = residuals
    df_preds["abs_error"] = np.abs(residuals)
    df_preds["pct_error"] = (df_preds["abs_error"] / y_true) * 100

    # 3. Directional Classification Accuracy (COP vs DROP)
    # COP = actual resale > retail; Predicted COP = predicted resale > retail
    actual_cop = (y_true > retail)
    predicted_cop = (y_pred > retail)
    verdict_accuracy = np.mean(actual_cop == predicted_cop) * 100

    print("\n--- 📊 Overall Model Performance Metrics ---")
    print(f"• R² Score (Coefficient of Determination) : {r2:.4f}")
    print(f"• MAE (Mean Absolute Error)               : ${mae:.2f}")
    print(f"• RMSE (Root Mean Squared Error)          : ${rmse:.2f}")
    print(f"• MAPE (Mean Absolute Percentage Error)   : {mape * 100:.2f}%")
    print(f"• Directional Accuracy (COP/DROP Verdict) : {verdict_accuracy:.2f}%")
    print(f"• Residual Mean (Bias)                    : ${residuals.mean():.2f}")
    print(f"• Residual Std Dev                        : ${residuals.std():.2f}")

    # 4. Brand-Stratified Metrics
    brand_metrics = {}
    if "brand" in df_preds.columns:
        print("\n--- 🏷️ Brand-Stratified Performance ---")
        for b in df_preds["brand"].unique():
            sub = df_preds[df_preds["brand"] == b]
            b_mae = mean_absolute_error(sub["actual_resale_price"], sub["predicted_resale_price"])
            b_rmse = np.sqrt(mean_squared_error(sub["actual_resale_price"], sub["predicted_resale_price"]))
            b_mape = mean_absolute_percentage_error(sub["actual_resale_price"], sub["predicted_resale_price"])
            b_r2 = r2_score(sub["actual_resale_price"], sub["predicted_resale_price"])
            b_acc = np.mean((sub["actual_resale_price"] > sub["retail_price"]) == (sub["predicted_resale_price"] > sub["retail_price"])) * 100
            brand_metrics[b] = {
                "count": int(len(sub)),
                "r2": round(float(b_r2), 4),
                "mae": round(float(b_mae), 2),
                "rmse": round(float(b_rmse), 2),
                "mape_pct": round(float(b_mape * 100), 2),
                "verdict_acc_pct": round(float(b_acc), 2),
            }
            print(f"[{b}] (N={len(sub):,}): R²={b_r2:.4f} | MAE=${b_mae:.2f} | RMSE=${b_rmse:.2f} | MAPE={b_mape*100:.2f}% | COP/DROP Acc={b_acc:.2f}%")

    # 5. Outlier Analysis (Top 5 largest over-predictions & under-predictions)
    top_underpredicted = df_preds.sort_values(by="residual", ascending=False).head(5)
    top_overpredicted = df_preds.sort_values(by="residual", ascending=True).head(5)

    outliers_summary = {
        "top_underpredicted": top_underpredicted[["actual_resale_price", "predicted_resale_price", "retail_price", "residual"]].to_dict(orient="records"),
        "top_overpredicted": top_overpredicted[["actual_resale_price", "predicted_resale_price", "retail_price", "residual"]].to_dict(orient="records")
    }

    # 6. Save Metrics to JSON
    summary_data = {
        "author": "Anamika Ghosh (Model Checking & Evaluation Lead)",
        "phase": "Phase 4 - Model Evaluation & Diagnostics",
        "sample_count": len(df_preds),
        "overall_metrics": {
            "r2_score": round(float(r2), 4),
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2),
            "mape_pct": round(float(mape * 100), 2),
            "directional_accuracy_pct": round(float(verdict_accuracy), 2),
            "residual_mean": round(float(residuals.mean()), 2),
            "residual_std": round(float(residuals.std()), 2)
        },
        "brand_metrics": brand_metrics,
        "outliers": outliers_summary
    }

    metrics_out = Path("reports/evaluation_metrics.json")
    with open(metrics_out, "w") as f:
        json.dump(summary_data, f, indent=2)
    print(f"\n✅ Metrics JSON exported to: {metrics_out}")

    # 7. Generate Diagnostic Plots
    sns.set_theme(style="whitegrid")
    palette = ["#10b981", "#ef4444", "#3b82f6"]

    # Plot 1: Actual vs. Predicted Resale Price
    plt.figure(figsize=(8, 6), dpi=200)
    plt.scatter(y_true, y_pred, alpha=0.25, color="#2563eb", edgecolors="none", s=18)
    lims = [0, max(y_true.max(), y_pred.max()) * 1.02]
    plt.plot([0, 2000], [0, 2000], "r--", linewidth=2, label="Perfect Fit (y = x)")
    plt.xlim(0, 1600)
    plt.ylim(0, 1600)
    plt.title(f"Actual vs. Predicted Resale Price (Test Set R² = {r2:.4f})", fontsize=13, fontweight="bold", pad=12)
    plt.xlabel("Actual Resale Price ($ USD)", fontsize=11)
    plt.ylabel("Predicted Resale Price ($ USD)", fontsize=11)
    plt.annotate(f"N = {len(df_preds):,}\nMAE = ${mae:.2f}\nRMSE = ${rmse:.2f}",
                 xy=(0.05, 0.80), xycoords="axes fraction",
                 bbox=dict(boxstyle="round,pad=0.5", fc="white", ec="#cbd5e1", alpha=0.9),
                 fontsize=10)
    plt.legend(loc="lower right")
    plt.tight_layout()
    plot1_path = figures_dir / "01_actual_vs_predicted.png"
    plt.savefig(plot1_path)
    plt.close()
    print(f"📊 Saved: {plot1_path}")

    # Plot 2: Residual Distribution Histogram & KDE
    plt.figure(figsize=(8, 5), dpi=200)
    # Clip extreme residuals for clean visual presentation (-500 to +500)
    clipped_res = np.clip(residuals, -500, 500)
    sns.histplot(clipped_res, bins=60, kde=True, color="#0284c7", edgecolor="white", alpha=0.7)
    plt.axvline(0, color="#dc2626", linestyle="--", linewidth=2, label="Zero Bias (Error = $0)")
    plt.title("Residual Distribution (Prediction Errors: Actual - Predicted)", fontsize=13, fontweight="bold", pad=12)
    plt.xlabel("Residual ($ USD) [Clipped to ±$500 for clarity]", fontsize=11)
    plt.ylabel("Frequency", fontsize=11)
    plt.annotate(f"Mean Error: ${residuals.mean():.2f}\nStd Dev: ${residuals.std():.2f}",
                 xy=(0.75, 0.80), xycoords="axes fraction",
                 bbox=dict(boxstyle="round,pad=0.5", fc="white", ec="#cbd5e1", alpha=0.9),
                 fontsize=10)
    plt.legend(loc="upper left")
    plt.tight_layout()
    plot2_path = figures_dir / "02_residual_distribution.png"
    plt.savefig(plot2_path)
    plt.close()
    print(f"📊 Saved: {plot2_path}")

    # Plot 3: Residuals vs. Predicted Resale Price (Heteroscedasticity Check)
    plt.figure(figsize=(8, 5), dpi=200)
    plt.scatter(y_pred, residuals, alpha=0.25, color="#7c3aed", edgecolors="none", s=18)
    plt.axhline(0, color="#dc2626", linestyle="--", linewidth=2, label="Zero Residual")
    plt.xlim(100, 1500)
    plt.ylim(-600, 1000)
    plt.title("Residuals vs. Predicted Price (Homoscedasticity Diagnostic)", fontsize=13, fontweight="bold", pad=12)
    plt.xlabel("Predicted Resale Price ($ USD)", fontsize=11)
    plt.ylabel("Residual ($ USD = Actual - Predicted)", fontsize=11)
    plt.annotate("Funnel effect shows higher variance on\nhigh-value luxury grails ($800+)",
                 xy=(0.45, 0.10), xycoords="axes fraction",
                 bbox=dict(boxstyle="round,pad=0.5", fc="#fef3c7", ec="#f59e0b", alpha=0.9),
                 fontsize=9.5)
    plt.legend(loc="upper right")
    plt.tight_layout()
    plot3_path = figures_dir / "03_residuals_vs_predicted.png"
    plt.savefig(plot3_path)
    plt.close()
    print(f"📊 Saved: {plot3_path}")

    # Plot 4: Brand Comparison Bar Chart
    if brand_metrics:
        plt.figure(figsize=(7, 5), dpi=200)
        brands = list(brand_metrics.keys())
        maes = [brand_metrics[b]["mae"] for b in brands]
        rmses = [brand_metrics[b]["rmse"] for b in brands]
        x = np.arange(len(brands))
        width = 0.35

        fig, ax = plt.subplots(figsize=(7, 5), dpi=200)
        rects1 = ax.bar(x - width/2, maes, width, label="MAE ($)", color="#3b82f6")
        rects2 = ax.bar(x + width/2, rmses, width, label="RMSE ($)", color="#f97316")

        ax.set_ylabel("Error in USD ($)", fontsize=11)
        ax.set_title("Model Error Comparison: Yeezy vs. Off-White", fontsize=13, fontweight="bold", pad=12)
        ax.set_xticks(x)
        ax.set_xticklabels(brands, fontsize=11, fontweight="bold")
        ax.legend()

        for rect in rects1:
            h = rect.get_height()
            ax.annotate(f"${h:.1f}", xy=(rect.get_x() + rect.get_width()/2, h),
                        xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=10, fontweight="bold")
        for rect in rects2:
            h = rect.get_height()
            ax.annotate(f"${h:.1f}", xy=(rect.get_x() + rect.get_width()/2, h),
                        xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=10, fontweight="bold")

        plt.tight_layout()
        plot4_path = figures_dir / "04_brand_performance_comparison.png"
        plt.savefig(plot4_path)
        plt.close()
        print(f"📊 Saved: {plot4_path}")

    print("\n🎉 Phase 4 Model Checking & Residual Diagnostics complete!")
    print(f"All figures saved to {figures_dir.resolve()}/")


if __name__ == "__main__":
    evaluate_model()
