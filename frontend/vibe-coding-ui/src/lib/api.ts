/**
 * DropOrCop API Client
 * Connects Next.js Frontend to FastAPI Backend at http://localhost:8000
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HealthResponse {
  status: string;
  service: string;
  model_loaded: boolean;
  model_status: string;
}

export interface BrandsResponse {
  brands: string[];
  total: number;
  default_retail: Record<string, number>;
}

export interface PredictPayload {
  brand: string;
  retail_price: number;
  shoe_size: number;
  days_since_release: number;
  sneaker_name?: string;
  threshold?: number;
}

export interface PredictResponse {
  brand: string;
  retail_price: number;
  shoe_size: number;
  days_since_release: number;
  estimated_resale_price: number;
  estimated_profit: number;
  profit_margin_pct: number;
  verdict: "COP" | "DROP";
  sneaker_name?: string | null;
}

export interface HistoryRecord {
  id: number;
  timestamp: string;
  brand: string;
  retail_price: number;
  shoe_size: number;
  days_since_release: number;
  estimated_resale_price: number;
  profit: number;
  margin_pct: number;
  verdict: "COP" | "DROP";
  sneaker_name?: string | null;
}

export interface HistoryResponse {
  total: number;
  predictions: HistoryRecord[];
}

export async function checkApiHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Health check HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return {
      status: "unreachable",
      service: "DropOrCop API",
      model_loaded: false,
      model_status: "disconnected",
    };
  }
}

export async function fetchBrands(): Promise<BrandsResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Brands fetch HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // Fallback default catalog
    return {
      brands: ["Yeezy", "Off-White", "Jordan", "Nike", "adidas", "New Balance"],
      total: 6,
      default_retail: {
        Yeezy: 220.0,
        "Off-White": 190.0,
        Jordan: 200.0,
        Nike: 150.0,
        adidas: 130.0,
        "New Balance": 160.0,
      },
    };
  }
}

export async function predictResale(payload: PredictPayload): Promise<PredictResponse> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorDetail = `Prediction failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return await res.json();
}

export async function fetchPredictionHistory(limit: number = 10): Promise<HistoryResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/history?limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`History fetch HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return { total: 0, predictions: [] };
  }
}
