"""
DropOrCop - FastAPI Service
Phase 5 Backend Service
Connects trained ML model to REST endpoints for sneaker resale valuation.
"""

import sys
import re
import os
import logging
import threading
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd

logger = logging.getLogger("droporcop.api")

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
    "Converse": 90.0,
    "ASICS": 150.0,
    "BAPE": 250.0,
    "Puma": 90.0,
    "Reebok": 90.0,
    "Salomon": 200.0,
    "Crocs": 60.0,
    "Timberland": 140.0,
    "UGG": 160.0,
}

# Brands present in the StockX training extract (data/processed/clean_stockx.csv).
# Everything else the API accepts is an extrapolation, and is flagged as such.
TRAINED_BRANDS = frozenset({"Yeezy", "Off-White"})

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
            logger.info("[DropOrCop API] Loaded and latency-optimized model artifact from %s", MODEL_PATH)
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

# Enable CORS for frontend integration.
# Accepts a comma-separated DROPORCOP_CORS_ORIGINS env var; defaults to the
# static-hosting use case (local dashboard + GitHub Pages demo).
_cors_origins = [
    origin.strip()
    for origin in os.getenv("DROPORCOP_CORS_ORIGINS", "*").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins or ["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):  # noqa: ARG001
    """
    Pydantic v2 echoes the offending input in 422 bodies; non-finite floats
    (NaN/Inf) are not JSON-serializable and crash the default handler, so we
    rebuild the errors from only JSON-safe fields.
    """
    safe_errors = []
    for error in exc.errors():
        safe_errors.append(
            {
                "type": error.get("type"),
                "loc": error.get("loc"),
                "msg": error.get("msg"),
            }
        )
    return JSONResponse(status_code=422, content={"detail": safe_errors})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):  # noqa: ARG001
    logger.exception("[DropOrCop API] Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


class PredictRequest(BaseModel):
    brand: str = Field(..., max_length=64, description="Sneaker brand (e.g. 'Yeezy', 'Off-White', 'adidas')", example="Yeezy")
    retail_price: float = Field(..., ge=1.0, le=100000.0, allow_inf_nan=False, description="Original retail price in USD", example=220.0)
    shoe_size: float = Field(..., ge=3.0, le=20.0, allow_inf_nan=False, description="US shoe size", example=10.5)
    days_since_release: int = Field(..., ge=0, le=36500, description="Days elapsed since release", example=45)
    sneaker_name: Optional[str] = Field(None, max_length=120, description="Sneaker model name", example="Yeezy Boost 350 V2")
    threshold: Optional[float] = Field(0.15, ge=0.0, le=1.0, allow_inf_nan=False, description="Margin threshold for COP recommendation", example=0.15)


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
    threshold: float = 0.15
    is_extrapolated: bool = False


@app.get("/")
def home():
    """Service metadata and root welcome endpoint."""
    return {
        "message": "Welcome to DropOrCop API!",
        "service": "DropOrCop Resale Valuation API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


def _sanitize_sneaker_name(name: Optional[str]) -> Optional[str]:
    if not name:
        return None
    # Strip control / invisible characters so the ledger stays printable.
    cleaned = "".join(ch for ch in name if ch.isprintable()).strip()
    if not cleaned:
        return None
    return cleaned[:120]


@app.get("/health")
def health_check():
    """Liveness check reporting server health and model connectivity."""
    current_model = load_model_instance()
    is_loaded = current_model is not None
    return {
        "status": "healthy" if is_loaded else "degraded",
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
        "trained_brands": sorted(TRAINED_BRANDS),
    }


@app.get("/history")
def get_prediction_history(limit: int = Query(10, ge=1, le=100)):
    """Retrieve recent prediction history from persistent SQLite database."""
    try:
        records = db_manager.get_recent_predictions(limit=limit)
        total = db_manager.get_prediction_count()
    except Exception:
        logger.exception("[DropOrCop API] Failed to read prediction history")
        raise HTTPException(status_code=503, detail="Prediction ledger is unavailable.")
    return {"total": total, "predictions": records}


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
        supported_list = sorted(set(CANONICAL_BRAND_MAP.values()))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported brand '{request.brand}'. Supported brands are: {supported_list}",
        )

    if not re.fullmatch(r"[A-Za-z0-9 .&'\-/]+", request.brand.strip()):
        raise HTTPException(status_code=400, detail="Brand contains invalid characters.")

    sneaker_name = _sanitize_sneaker_name(request.sneaker_name)
    is_extrapolated = canonical_brand not in TRAINED_BRANDS

    # 2. Prepare DataFrame row for Scikit-Learn pipeline
    row: Dict[str, Any] = {
        "brand": canonical_brand,
        "retail_price": float(request.retail_price),
        "shoe_size": float(request.shoe_size),
        "days_since_release": int(request.days_since_release),
    }
    if sneaker_name:
        row["sneaker_name"] = sneaker_name

    input_df = pd.DataFrame([row])

    # 3. Model inference
    try:
        raw_pred = float(trained_model.predict(input_df)[0])
    except Exception:
        logger.exception("[DropOrCop API] Inference pipeline failed")
        raise HTTPException(status_code=500, detail="Inference pipeline execution error.")

    pred_resale = round(raw_pred, 2)
    retail = round(float(request.retail_price), 2)
    estimated_profit = round(pred_resale - retail, 2)
    profit_margin_pct = round((estimated_profit / retail) * 100, 2) if retail > 0 else 0.0

    # 4. Safe threshold evaluation (gracefully fallback if threshold is None)
    threshold = request.threshold if request.threshold is not None else 0.15
    verdict = "COP" if estimated_profit / retail >= threshold else "DROP"

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
            sneaker_name=sneaker_name,
        )
    except Exception:
        logger.exception("[DropOrCop API] Failed to log prediction to database")

    return PredictResponse(
        brand=canonical_brand,
        retail_price=retail,
        shoe_size=request.shoe_size,
        days_since_release=request.days_since_release,
        estimated_resale_price=pred_resale,
        estimated_profit=estimated_profit,
        profit_margin_pct=profit_margin_pct,
        verdict=verdict,
        sneaker_name=sneaker_name,
        threshold=round(float(threshold), 4),
        is_extrapolated=is_extrapolated,
    )
