# Phase 1: Codebase Reconnaissance & Master Architecture Plan

> **Project:** DropOrCop - Sneaker Resale Profit Predictor  
> **Tech Stack:** FastAPI Backend (`api/main.py`), SQLite WAL (`src/db.py`), Scikit-Learn Pipeline (`models/best_model.joblib`), Next.js 16 / React 19 Frontend (`frontend/vibe-coding-ui`).

---

## 1. System Inventory

| Component | Technology | File Path | Function |
| :--- | :--- | :--- | :--- |
| **API Server** | FastAPI, Uvicorn, Pydantic v2 | `api/main.py` | Exposes REST endpoints; manages ML lifecycle and thread safety. |
| **Persistence** | SQLite3 (WAL mode) | `src/db.py` | Records prediction logs in `data/droporcop.db`; indexes queries by timestamp and brand. |
| **ML Engine** | Scikit-Learn Pipeline, Joblib | `models/best_model.joblib` | Random Forest regressor with one-hot encoding and keyword extractor. |
| **Feature Layer** | Custom Scikit Transformer | `src/feature_extractor.py` | Derives hype and silhouette binary flags from sneaker text. |
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Motion | `frontend/vibe-coding-ui` | Client interface for valuation entry and result rendering. |

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 16 / React 19)"]
        UI_Cockpit["Valuation Cockpit (Inputs)"]
        UI_Badge["COP / DROP Verdict Display"]
        UI_Ledger["Recent Predictions Ledger"]
        UI_Health["System Status Banner"]
    end

    subgraph Server["FastAPI Backend (Port 8000)"]
        Router["FastAPI Router"]
        Cors["CORS Middleware (allow_origins: *)"]
        LifeSpan["Lifespan Startup Manager"]
        InferenceEngine["Model Runtime (n_jobs=1)"]
        DBHandler["SQLite Database Manager"]
    end

    subgraph Storage["Persistent Layer & Artifacts"]
        ModelArtifact[("models/best_model.joblib")]
        SQLiteDB[("data/droporcop.db (WAL)")]
    end

    UI_Cockpit -->|POST /predict| Router
    UI_Health -->|GET /health| Router
    UI_Cockpit -->|GET /brands| Router
    UI_Ledger -->|GET /history| Router

    Router --> Cors
    LifeSpan -->|Loads on Boot| ModelArtifact
    LifeSpan -->|Initializes Schema| SQLiteDB
    Router -->|Dispatches Inference| InferenceEngine
    InferenceEngine -->|Evaluates Features| ModelArtifact
    Router -->|Logs Prediction Record| DBHandler
    DBHandler -->|Persists Data| SQLiteDB
    Router -->|JSON Response| Client
```

---

## 3. Database Schema Specification (`data/droporcop.db`)

```mermaid
erDiagram
    PREDICTIONS {
        INTEGER id PK "AUTOINCREMENT"
        DATETIME timestamp "DEFAULT CURRENT_TIMESTAMP"
        TEXT brand "NOT NULL"
        REAL retail_price "NOT NULL"
        REAL shoe_size "NOT NULL"
        INTEGER days_since_release "NOT NULL"
        REAL estimated_resale_price "NOT NULL"
        REAL profit "NOT NULL"
        REAL margin_pct "NOT NULL"
        TEXT verdict "NOT NULL: 'COP' | 'DROP'"
        TEXT sneaker_name "NULLABLE"
    }
```

- **Table:** `predictions`
- **Index 1:** `idx_predictions_timestamp ON predictions (timestamp DESC)`
- **Index 2:** `idx_predictions_brand ON predictions (brand)`
- **PRAGMA Settings:** `journal_mode=WAL`, `synchronous=NORMAL`

---

## 4. API Integration Contracts

### Contract 1: `GET /health`
- **Response:**
```json
{
  "status": "healthy",
  "service": "DropOrCop API",
  "model_loaded": true,
  "model_status": "connected"
}
```

### Contract 2: `GET /brands`
- **Response:**
```json
{
  "brands": ["Yeezy", "Off-White", "Jordan", "Nike", "adidas", "New Balance"],
  "total": 6,
  "default_retail": {
    "Yeezy": 220.0,
    "Off-White": 190.0,
    "Jordan": 200.0,
    "Nike": 150.0,
    "adidas": 130.0,
    "New Balance": 160.0
  }
}
```

### Contract 3: `POST /predict`
- **Request Body:**
```json
{
  "brand": "Yeezy",
  "retail_price": 220.0,
  "shoe_size": 10.5,
  "days_since_release": 45,
  "sneaker_name": "Yeezy Boost 350 V2 Zebra",
  "threshold": 0.15
}
```
- **Response:**
```json
{
  "brand": "Yeezy",
  "retail_price": 220.0,
  "shoe_size": 10.5,
  "days_since_release": 45,
  "estimated_resale_price": 340.91,
  "estimated_profit": 120.91,
  "profit_margin_pct": 54.96,
  "verdict": "COP",
  "sneaker_name": "Yeezy Boost 350 V2 Zebra"
}
```
- **Decision Invariant:**
  $$\text{verdict} = \begin{cases} \text{COP} & \text{if } \frac{\text{estimated\_profit}}{\text{retail\_price}} \ge \text{threshold} \\ \text{DROP} & \text{otherwise} \end{cases}$$

### Contract 4: `GET /history?limit={limit}`
- **Query Parameter:** `limit` (Integer, 1-100, default 10)
- **Response:**
```json
{
  "total": 1,
  "predictions": [
    {
      "id": 1,
      "timestamp": "2026-11-18 07:42:01",
      "brand": "Yeezy",
      "retail_price": 220.0,
      "shoe_size": 10.5,
      "days_since_release": 45,
      "estimated_resale_price": 340.91,
      "profit": 120.91,
      "margin_pct": 54.96,
      "verdict": "COP",
      "sneaker_name": "Yeezy Boost 350 V2 Zebra"
    }
  ]
}
```

---

## 5. End-to-End Sequence & User Journey

```mermaid
sequenceDiagram
    autonumber
    actor User as Collector / Arbitrageur
    participant UI as Next.js Web Interface
    participant API as FastAPI Backend
    participant ML as RF ML Pipeline
    participant DB as SQLite DB

    User->>UI: Opens valuation interface
    UI->>API: GET /health
    API-->>UI: 200 OK (model_loaded: true)
    UI->>API: GET /brands
    API-->>UI: 200 OK (brands list + default MSRP)
    UI->>API: GET /history?limit=5
    API->>DB: Query recent predictions
    DB-->>API: Rows
    API-->>UI: 200 OK (historical cards)

    User->>UI: Selects Brand, Model Name, Size, Release Days, and Threshold
    User->>UI: Clicks "Calculate Resale Valuation"
    UI->>UI: Transitions button state to loading skeleton
    UI->>API: POST /predict
    API->>ML: Pass structured DataFrame row
    ML-->>API: Raw predicted price ($)
    API->>API: Compute profit, margin %, and COP/DROP verdict
    API->>DB: INSERT into predictions table
    DB-->>API: Row ID
    API-->>UI: 200 OK (PredictResponse)

    UI->>UI: Plays entrance micro-animation
    UI->>User: Displays COP/DROP stamp, ROI %, and profit metrics
    UI->>UI: Prepends valuation to local ledger table
```

---

## 6. Required UI Views & Component Breakdown

```mermaid
graph TD
    Root["App Root (page.tsx)"]
    Nav["Navigation & Engine Status Bar"]
    Hero["Hero Header & Metric Badges"]
    Cockpit["Valuation Cockpit (Two-Column Grid)"]
    LeftCol["Input Controls Panel"]
    RightCol["Valuation Verdict Stage"]
    HistorySection["Real-Time Valuation Ledger"]

    Root --> Nav
    Root --> Hero
    Root --> Cockpit
    Root --> HistorySection

    Nav --> StatusPill["Live Backend Ping & Model Status"]
    Nav --> BrandLogo["DropOrCop Identity"]

    Cockpit --> LeftCol
    Cockpit --> RightCol

    LeftCol --> BrandPicker["Brand Selector Chips"]
    LeftCol --> ModelInput["Sneaker Model Name Input"]
    LeftCol --> PriceSizeGroup["Retail MSRP ($) & Shoe Size (US)"]
    LeftCol --> DaysSlider["Release Age Slider (0 - 365+ days)"]
    LeftCol --> ThresholdSlider["Arbitrage Threshold Slider (5% - 50%)"]
    LeftCol --> SubmitBtn["Valuation CTA Button with Motion"]

    RightCol --> VerdictCard["Animated COP / DROP Stamp Badge"]
    RightCol --> PriceDisplay["Estimated Resale Price Counter"]
    RightCol --> MarginMetrics["Net Profit ($) and ROI (%) Badges"]
    RightCol --> QuickSummary["Valuation Confidence & Summary"]

    HistorySection --> HistoryTable["Recent Valuations Table / Cards"]
```
