/**
 * DropOrCop API Client
 *
 * Talks to the FastAPI backend when one is configured. On a static export
 * (GitHub Pages) there is no backend, so requests are skipped entirely and
 * the UI runs in an explicit demo mode instead of calling the visitor's own
 * localhost.
 *
 * Error policy
 * - Network failures (backend down) fall back to a clearly labelled local
 *   estimate and are marked `is_estimate: true`.
 * - HTTP errors from the server (400/422/5xx) are thrown, never silently
 *   replaced by a fabricated result.
 */

const CONFIGURED_API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

function resolveApiBaseUrl(): string | null {
  if (CONFIGURED_API_URL) return CONFIGURED_API_URL;
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
    return "http://localhost:8000";
  }
  return null;
}

export function isApiConfigured(): boolean {
  return resolveApiBaseUrl() !== null;
}

const REQUEST_TIMEOUT_MS = 6000;

function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return error.name === "AbortError" || error.name === "TimeoutError";
  }
  return false;
}

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
  trained_brands?: string[];
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
  /** True when the server reports the brand is outside the training data. */
  is_extrapolated?: boolean;
  /** True when the value came from the offline fallback, not the model. */
  is_estimate?: boolean;
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = resolveApiBaseUrl();
  if (!baseUrl) {
    throw new ApiUnavailableError();
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (isNetworkFailure(error)) throw new ApiUnavailableError();
    throw error;
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
      else if (Array.isArray(body?.detail) && body.detail[0]?.msg) detail = body.detail[0].msg;
    } catch {
      // Response had no JSON body; keep the HTTP status message.
    }
    throw new ApiError(res.status, detail);
  }

  return (await res.json()) as T;
}

/** Thrown when no API backend is reachable at all (static export / offline). */
export class ApiUnavailableError extends Error {
  constructor() {
    super("DropOrCop API is not configured on this deployment.");
    this.name = "ApiUnavailableError";
  }
}

/** Thrown when the server answered with a non-2xx status. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const FALLBACK_BRANDS = ["Yeezy", "Off-White", "Jordan", "Nike", "adidas", "New Balance"];
const FALLBACK_RETAIL: Record<string, number> = {
  Yeezy: 220.0,
  "Off-White": 190.0,
  Jordan: 200.0,
  Nike: 150.0,
  adidas: 130.0,
  "New Balance": 160.0,
};

export function getFallbackBrandsResponse(): BrandsResponse {
  return {
    brands: FALLBACK_BRANDS,
    total: FALLBACK_BRANDS.length,
    default_retail: FALLBACK_RETAIL,
    trained_brands: ["Yeezy", "Off-White"],
  };
}

export async function checkApiHealth(): Promise<HealthResponse> {
  try {
    return await request<HealthResponse>("/health", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  } catch {
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
    return await request<BrandsResponse>("/brands", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  } catch {
    return getFallbackBrandsResponse();
  }
}

export function predictResaleOffline(payload: PredictPayload): PredictResponse {
  const threshold = typeof payload.threshold === "number" && Number.isFinite(payload.threshold)
    ? payload.threshold
    : 0.15;
  const retail = Number(payload.retail_price);
  const days = Number(payload.days_since_release);
  const brand = payload.brand || "Yeezy";

  if (!Number.isFinite(retail) || retail <= 0) {
    throw new ApiError(422, "Original shop price must be a positive number.");
  }
  if (!Number.isFinite(days) || days < 0) {
    throw new ApiError(422, "Days since release cannot be negative.");
  }

  const brandMultiplier =
    brand === "Off-White"
      ? 2.35
      : brand === "Jordan"
        ? 1.75
        : brand === "Yeezy"
          ? 1.55
          : brand === "Nike"
            ? 1.28
            : brand === "New Balance"
              ? 1.18
              : 1.15;
  const timeFactor = Math.max(0.8, 1 - (days / 730) * 0.2);
  const estimatedResale = Math.round(retail * brandMultiplier * timeFactor * 100) / 100;
  const profit = Math.round((estimatedResale - retail) * 100) / 100;
  const margin = Math.round((profit / retail) * 10000) / 100;

  return {
    brand: payload.brand,
    retail_price: retail,
    shoe_size: payload.shoe_size,
    days_since_release: days,
    estimated_resale_price: estimatedResale,
    estimated_profit: profit,
    profit_margin_pct: margin,
    verdict: profit / retail >= threshold ? "COP" : "DROP",
    sneaker_name: payload.sneaker_name || null,
    is_extrapolated: brand !== "Yeezy" && brand !== "Off-White",
    is_estimate: true,
  };
}

export async function predictResale(payload: PredictPayload): Promise<PredictResponse> {
  const threshold = typeof payload.threshold === "number" && Number.isFinite(payload.threshold)
    ? payload.threshold
    : 0.15;

  try {
    const res = await request<PredictResponse>("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, threshold }),
    });
    return { ...res, is_estimate: false };
  } catch (err) {
    // Only fall back when the server is genuinely unreachable; surface real
    // validation/server errors to the user instead of inventing a result.
    if (!(err instanceof ApiUnavailableError)) {
      throw err;
    }
  }

  return predictResaleOffline(payload);
}

export async function fetchPredictionHistory(limit: number = 10): Promise<HistoryResponse> {
  return request<HistoryResponse>(`/history?limit=${encodeURIComponent(limit)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
}
