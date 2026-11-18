"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  checkApiHealth,
  fetchBrands,
  fetchPredictionHistory,
  getFallbackBrandsResponse,
  predictResale,
  predictResaleOffline,
  type HealthResponse,
  type HistoryRecord,
  type PredictPayload,
  type PredictResponse,
} from "@/lib/api";
import { scrollToSection } from "@/lib/scroll";
import { REFERENCE_SNEAKERS, type CatalogSneaker } from "@/lib/sneakers";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Watchlist } from "@/components/Watchlist";
import { ValuationCockpit } from "@/components/ValuationCockpit";
import { SneakerCard3D } from "@/components/SneakerCard3D";
import { ModelDiagnosticsCard } from "@/components/ModelDiagnosticsCard";
import { HistoryLedger } from "@/components/HistoryLedger";
import { AlertTriangle, X } from "lucide-react";

const HEALTH_RETRY_MS = 2000;
const HEALTH_MAX_ATTEMPTS = 8;
const DISCLAIMER =
  "Estimates from a model trained on Yeezy & Off-White StockX sales. Not financial advice.";

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [supportedBrands, setSupportedBrands] = useState<string[]>([]);
  const [trainedBrands, setTrainedBrands] = useState<string[]>([]);
  const [defaultRetailMap, setDefaultRetailMap] = useState<Record<string, number>>({});
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [activeValuation, setActiveValuation] = useState<PredictResponse | null>(null);
  const [activeThreshold, setActiveThreshold] = useState(0.15);
  const [prefillData, setPrefillData] = useState<Partial<PredictPayload> | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isRefreshingLedger, setIsRefreshingLedger] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const didBootstrapRef = useRef(false);
  const healthStatusRef = useRef<string | undefined>(undefined);
  const modelOnline = Boolean(health?.model_loaded);
  const healthStatus = health?.status;

  const loadInitialData = useCallback(async () => {
    if (didBootstrapRef.current) return;
    didBootstrapRef.current = true;

    const healthRes = await checkApiHealth();
    setHealth(healthRes);
    healthStatusRef.current = healthRes.status;

    if (healthRes.status === "unreachable") {
      const fallback = getFallbackBrandsResponse();
      setSupportedBrands(fallback.brands);
      setTrainedBrands(fallback.trained_brands ?? ["Yeezy", "Off-White"]);
      setDefaultRetailMap(fallback.default_retail);
      setHistoryRecords([]);
      setHistoryTotal(0);
      return;
    }

    const [brandsRes, historyRes] = await Promise.allSettled([
      fetchBrands(),
      fetchPredictionHistory(20),
    ]);

    if (brandsRes.status === "fulfilled") {
      setSupportedBrands(brandsRes.value.brands);
      setTrainedBrands(brandsRes.value.trained_brands ?? ["Yeezy", "Off-White"]);
      setDefaultRetailMap(brandsRes.value.default_retail);
    }
    if (historyRes.status === "fulfilled") {
      setHistoryRecords(historyRes.value.predictions);
      setHistoryTotal(historyRes.value.total);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- one-time async bootstrap from external APIs */
  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (modelOnline || !healthStatus || healthStatus === "unreachable") return;

    let attempts = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      attempts += 1;
      const latest = await checkApiHealth();
      if (cancelled) return;
      setHealth(latest);
      healthStatusRef.current = latest.status;
      if (latest.status === "unreachable") return;
      if (!latest.model_loaded && attempts < HEALTH_MAX_ATTEMPTS) {
        timer = setTimeout(poll, HEALTH_RETRY_MS);
      }
    };

    timer = setTimeout(poll, HEALTH_RETRY_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [modelOnline, healthStatus]);

  const handleRefreshHealth = useCallback(async () => {
    const latest = await checkApiHealth();
    setHealth(latest);
    healthStatusRef.current = latest.status;
  }, []);

  const handleRefreshLedger = useCallback(async () => {
    setIsRefreshingLedger(true);
    try {
      const histData = await fetchPredictionHistory(20);
      setHistoryRecords(histData.predictions);
      setHistoryTotal(histData.total);
    } catch (err) {
      console.error("[DropOrCop] Failed to refresh past checks", err);
      setActionError(
        err instanceof ApiError ? err.message : "Couldn't reach the saved checks."
      );
    } finally {
      setIsRefreshingLedger(false);
    }
  }, []);

  const runPrediction = useCallback(async (payload: PredictPayload) => {
    const requestId = ++requestIdRef.current;
    setIsPredicting(true);
    setActionError(null);
    setActiveThreshold(payload.threshold ?? 0.15);

    try {
      const res =
        healthStatusRef.current === "unreachable"
          ? predictResaleOffline(payload)
          : await predictResale(payload);
      if (requestId !== requestIdRef.current) return;
      setActiveValuation(res);
      if (!res.is_estimate) {
        try {
          const histData = await fetchPredictionHistory(20);
          if (requestId !== requestIdRef.current) return;
          setHistoryRecords(histData.predictions);
          setHistoryTotal(histData.total);
        } catch {
          // History is best-effort; never fail a valuation over it.
        }
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("[DropOrCop] Check failed", err);
      setActionError(err instanceof Error ? err.message : "The check failed. Try again.");
    } finally {
      if (requestId === requestIdRef.current) setIsPredicting(false);
    }
  }, []);

  const handleCalculateValuation = useCallback(
    async (payload: PredictPayload) => {
      await runPrediction(payload);
    },
    [runPrediction]
  );

  const handleSelectRecordFromHistory = (rec: HistoryRecord) => {
    const payload: PredictPayload = {
      brand: rec.brand,
      retail_price: rec.retail_price,
      shoe_size: rec.shoe_size,
      days_since_release: rec.days_since_release,
      sneaker_name: rec.sneaker_name || undefined,
      threshold: 0.15,
    };
    setPrefillData(payload);
    void runPrediction(payload);
    scrollToSection("valuation-cockpit-section");
  };

  const handleValuateSneaker = useCallback(
    (
      sneaker:
        | Pick<CatalogSneaker, "brand" | "name" | "retail" | "size" | "days">
        | Partial<PredictPayload>,
      shouldScroll = true
    ) => {
      const payload: Partial<PredictPayload> =
        "retail" in sneaker
          ? {
              brand: sneaker.brand,
              sneaker_name: sneaker.name,
              retail_price: sneaker.retail,
              shoe_size: sneaker.size,
              days_since_release: sneaker.days,
            }
          : sneaker;

      setPrefillData(payload);
      if (
        payload.brand &&
        payload.retail_price !== undefined &&
        payload.shoe_size !== undefined &&
        payload.days_since_release !== undefined
      ) {
        void runPrediction({
          brand: payload.brand,
          retail_price: payload.retail_price,
          shoe_size: payload.shoe_size,
          days_since_release: payload.days_since_release,
          sneaker_name: payload.sneaker_name,
          threshold: 0.15,
        });
      }
      if (shouldScroll) {
        scrollToSection("valuation-cockpit-section");
      }
    },
    [runPrediction]
  );

  const handleHeroSelect = (index: number) => {
    const sneaker = REFERENCE_SNEAKERS[index];
    if (sneaker) handleValuateSneaker(sneaker, false);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip overflow-y-visible bg-canvas text-ink-1">
      <Header
        health={health}
        onRefreshHealth={handleRefreshHealth}
        onSelectSneaker={handleValuateSneaker}
      />

      <Hero
        onExploreClick={() => scrollToSection("valuation-cockpit-section")}
        onSelectSneaker={handleHeroSelect}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-14 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {actionError && (
          <div role="alert" className="flex items-start gap-3 rounded-panel border border-drop/50 bg-drop/10 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-drop" aria-hidden="true" />
            <p className="flex-1 text-14 leading-snug text-ink-1">{actionError}</p>
            <button
              type="button"
              onClick={() => setActionError(null)}
              aria-label="Dismiss message"
              className="rounded-card p-1 text-ink-3 transition-colors hover:text-ink-1"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <Watchlist onSelectSneaker={handleValuateSneaker} />

        <section
          id="valuation-cockpit-section"
          aria-label="verdict"
          className="grid scroll-mt-20 grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8"
        >
          <div className="lg:col-span-7">
            <ValuationCockpit
              supportedBrands={supportedBrands}
              defaultRetailMap={defaultRetailMap}
              trainedBrands={trainedBrands}
              onSubmit={handleCalculateValuation}
              isLoading={isPredicting}
              prefillData={prefillData}
            />
            <p className="mt-3 text-12 text-ink-3">
              Every verdict is a model estimate, not a trade signal.
            </p>
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-20">
            <SneakerCard3D
              result={activeValuation}
              isLoading={isPredicting}
              threshold={activeThreshold}
            />
          </div>
        </section>

        <ModelDiagnosticsCard />

        <HistoryLedger
          records={historyRecords}
          totalCount={historyTotal}
          isOffline={!modelOnline}
          onSelectRecord={handleSelectRecordFromHistory}
          onRefresh={handleRefreshLedger}
          isLoading={isRefreshingLedger}
          onStart={() => scrollToSection("valuation-cockpit-section")}
        />
      </main>

      <footer className="w-full border-t border-hairline py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:px-8">
          <p className="text-14 font-bold text-ink-2">
            DropOrCop · Group G · Department of Computer Science &amp; Engineering · Faculty mentor: Megha Gupta
          </p>
          <p className="text-12 text-ink-3">
            Provenance: a student-trained model built on public StockX sale records.
          </p>
          <p className="text-12 text-ink-3">{DISCLAIMER}</p>
        </div>
      </footer>
    </div>
  );
}
