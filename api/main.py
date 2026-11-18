"""
DropOrCop - FastAPI Service
Phase 5 Backend Service
Connects trained ML model to REST endpoints for sneaker resale valuation.
"""

import sys
import threading
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.db import DatabaseManager

MODEL_PATH = PROJECT_ROOT / "models" / "best_model.joblib"
db_manager = DatabaseManager(db_path=PROJECT_ROOT / "data" / "droporcop.db")

# Brand normalization dictionary mapping lowercase inputs to pipeline trained categories
CANONICAL_BRAND_MAP = {
    "yeezy": "Yeezy",
    "off-white": "Off-White",
    "jordan": "Jordan",
    "nike": "Nike",
    "adidas": "adidas",
    "new balance": "New Balance",
    "converse": "Converse",
    "asics": "ASICS",
    "bape": "BAPE",
    "puma": "Puma",
    "reebok": "Reebok",
    "salomon": "Salomon",
    "crocs": "Crocs",
    "timberland": "Timberland",
    "ugg": "UGG",
}

DEFAULT_RETAIL_PRICES = {
    "Yeezy": 220.0,
    "Off-White": 190.0,
    "Jordan": 200.0,
    "Nike": 150.0,
    "adidas": 130.0,
    "New Balance": 160.0,
}

model = None
model_lock = threading.Lock()


def load_model_instance():
    """Load model pipeline into memory and optimize regressor for single-sample inference."""
    global model
    with model_lock:
        if model is None and MODEL_PATH.exists():
            loaded = joblib.load(MODEL_PATH)
            # Optimize inference latency: set n_jobs=1 on regressor to eliminate thread pool churn
            if hasattr(loaded, "named_steps") and "regressor" in loaded.named_steps:
                regressor = loaded.named_steps["regressor"]
                if hasattr(regressor, "n_jobs"):
                    regressor.n_jobs = 1
            model = loaded
            print(f"[DropOrCop API] Loaded and latency-optimized model artifact from {MODEL_PATH}")
    return model


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: initialize database schema and load ML model at startup."""
    db_manager.init_db()
    load_model_instance()
    yield


app = FastAPI(
    title="DropOrCop Resale Valuation API",
    description="Predicts sneaker resale prices and COP/DROP verdicts.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    brand: str = Field(..., description="Sneaker brand (e.g. 'Yeezy', 'Off-White', 'adidas')", example="Yeezy")
    retail_price: float = Field(..., gt=0, description="Original retail price in USD", example=220.0)
    shoe_size: float = Field(..., gt=0, description="US shoe size", example=10.5)
    days_since_release: int = Field(..., ge=0, description="Days elapsed since release", example=45)
    sneaker_name: Optional[str] = Field(None, description="Sneaker model name", example="Yeezy Boost 350 V2")
    threshold: Optional[float] = Field(0.15, description="Margin threshold for COP recommendation", example=0.15)


class PredictResponse(BaseModel):
    brand: str
    retail_price: float
    shoe_size: float
    days_since_release: int
    estimated_resale_price: float
    estimated_profit: float
    profit_margin_pct: float
    verdict: str
    sneaker_name: Optional[str] = None


@app.get("/")
def home():
    """Service metadata and root welcome endpoint."""
    return {
        "message": "Welcome to DropOrCop API!",
        "service": "DropOrCop Resale Valuation API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check():
    """Liveness check reporting server health and model connectivity."""
    current_model = load_model_instance()
    is_loaded = current_model is not None
    return {
        "status": "healthy",
        "service": "DropOrCop API",
        "model_loaded": is_loaded,
        "model_status": "connected" if is_loaded else "disconnected",
    }


@app.get("/brands")
def get_supported_brands():
    """List supported sneaker brands and typical retail pricing."""
    brands = list(DEFAULT_RETAIL_PRICES.keys())
    return {
        "brands": brands,
        "total": len(brands),
        "default_retail": DEFAULT_RETAIL_PRICES,
    }


@app.get("/history")
def get_prediction_history(limit: int = Query(10, ge=1, le=100)):
    """Retrieve recent prediction history from persistent SQLite database."""
    records = db_manager.get_recent_predictions(limit=limit)
    return {"total": len(records), "predictions": records}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    """
    Predicts secondary market resale price, profit margin, and COP/DROP verdict.
    Persists prediction log to database.
    """
    trained_model = load_model_instance()
    if trained_model is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model artifact '{MODEL_PATH}' is not available on server.",
        )

    # 1. Normalize brand casing and validate against supported brands catalog
    cleaned_brand = request.brand.strip().lower()
    canonical_brand = CANONICAL_BRAND_MAP.get(cleaned_brand)

    if not canonical_brand:
        supported_list = sorted(list(set(CANONICAL_BRAND_MAP.values())))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported brand '{request.brand}'. Supported brands are: {supported_list}",
        )

    # 2. Prepare DataFrame row for Scikit-Learn pipeline
    row: Dict[str, Any] = {
        "brand": canonical_brand,
        "retail_price": float(request.retail_price),
        "shoe_size": float(request.shoe_size),
        "days_since_release": int(request.days_since_release),
    }
    if request.sneaker_name:
        row["sneaker_name"] = request.sneaker_name

    input_df = pd.DataFrame([row])

    # 3. Model inference
    try:
        raw_pred = float(trained_model.predict(input_df)[0])
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Inference pipeline execution error: {str(exc)}",
        )

    pred_resale = round(raw_pred, 2)
    retail = round(float(request.retail_price), 2)
    estimated_profit = round(pred_resale - retail, 2)
    profit_margin_pct = round((estimated_profit / retail) * 100, 2) if retail > 0 else 0.0

    # 4. Safe threshold evaluation (gracefully fallback if threshold is None)
    threshold = request.threshold if request.threshold is not None else 0.15
    if retail > 0:
        verdict = "COP" if (estimated_profit / retail) >= threshold else "DROP"
    else:
        verdict = "DROP"

    # 5. Log prediction to database
    try:
        db_manager.log_prediction(
            brand=canonical_brand,
            retail_price=retail,
            shoe_size=request.shoe_size,
            days_since_release=request.days_since_release,
            estimated_resale_price=pred_resale,
            profit=estimated_profit,
            margin_pct=profit_margin_pct,
            verdict=verdict,
            sneaker_name=request.sneaker_name,
        )
    except Exception as db_err:
        print(f"[DropOrCop API] Warning: Failed to log prediction to database: {db_err}")

    return PredictResponse(
        brand=canonical_brand,
        retail_price=retail,
        shoe_size=request.shoe_size,
        days_since_release=request.days_since_release,
        estimated_resale_price=pred_resale,
        estimated_profit=estimated_profit,
        profit_margin_pct=profit_margin_pct,
        verdict=verdict,
        sneaker_name=request.sneaker_name,
    )
