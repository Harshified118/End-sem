# DropOrCop API Documentation (Phase 5 - Backend)

**Author:** Sinthoiba Kangjam (Backend / Integration Lead, Group G)  
**Service:** FastAPI Sneaker Resale Valuation API  
**Default Host & Port:** `http://localhost:8000`  
**Interactive Swagger Docs:** `http://localhost:8000/docs`  
**Alternative ReDoc:** `http://localhost:8000/redoc`

---

## 1. Overview
The DropOrCop API wraps the serialized Scikit-learn Random Forest regression model (`models/best_model.joblib`) into high-performance REST endpoints. It provides real-time resale price predictions, calculates expected profit or loss against retail MSRP, and outputs a COP/DROP recommendation badge.

---

## 2. Quickstart

### Starting the Server
```bash
# Option A: Run via api module (Recommended)
uvicorn api.main:app --reload --port 8000

# Option B: Run via root entrypoint
uvicorn main:app --reload --port 8000

# Option C: Direct Python execution
python main.py
```

### Running the Test Suite
```bash
python -m unittest tests/test_api.py
```

---

## 3. API Endpoints

### `GET /`
Home welcome endpoint providing API service metadata and documentation links.
* **Response `200 OK`:**
```json
{
  "message": "Welcome to DropOrCop API!",
  "service": "DropOrCop Resale Valuation API",
  "version": "1.0.0",
  "docs_url": "/docs"
}
```

---

### `GET /health`
Liveness and model status check.
* **Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "DropOrCop API",
  "model_loaded": true,
  "model_status": "connected"
}
```

---

### `GET /brands`
Returns the sneaker lines supported by the trained ML pipeline and standard retail baseline prices.
* **Response `200 OK`:**
```json
{
  "brands": ["Yeezy", "Off-White"],
  "total": 2,
  "default_retail": {
    "Yeezy": 220.0,
    "Off-White": 190.0
  }
}
```

---

### `POST /predict`
Inference endpoint calculating resale price, profit, and COP/DROP classification.

#### Request Body (JSON)
| Field | Type | Required | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `brand` | string | Yes | Sneaker brand (`"Yeezy"` or `"Off-White"`) | `"Yeezy"` |
| `retail_price` | float | Yes | Retail price in USD ($>0$) | `220.0` |
| `shoe_size` | float | Yes | US Shoe Size ($>0$) | `10.5` |
| `days_since_release` | integer | Yes | Days elapsed since release date ($\ge 0$) | `45` |
| `threshold` | float | No | Profit margin threshold for COP verdict (default: `0.15`) | `0.15` |

**Example Request:**
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Yeezy",
    "retail_price": 220.0,
    "shoe_size": 10.5,
    "days_since_release": 45,
    "threshold": 0.15
  }'
```

#### Response `200 OK`
```json
{
  "brand": "Yeezy",
  "retail_price": 220.0,
  "shoe_size": 10.5,
  "days_since_release": 45,
  "estimated_resale_price": 340.91,
  "estimated_profit": 120.91,
  "profit_margin_pct": 54.96,
  "verdict": "COP"
}
```

---

## 4. Error Responses
- **`400 Bad Request`**: Unsupported brand passed in request payload.
- **`422 Unprocessable Entity`**: Missing or invalid field types (handled automatically via Pydantic).
- **`503 Service Unavailable`**: Model artifact missing on server.
