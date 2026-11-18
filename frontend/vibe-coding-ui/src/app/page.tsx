"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  checkApiHealth,
  fetchBrands,
  fetchPredictionHistory,
  predictResale,
  HealthResponse,
  HistoryRecord,
  PredictPayload,
  PredictResponse,
} from "@/lib/api";
import { Header } from "@/components/Header";
import { ValuationCockpit } from "@/components/ValuationCockpit";
import { SneakerCard3D } from "@/components/SneakerCard3D";
import { HistoryLedger } from "@/components/HistoryLedger";
import { ModelDiagnosticsCard } from "@/components/ModelDiagnosticsCard";
import { SquigglyFilter } from "@/components/motion/SquigglyFilter";
import { MarketMarquee } from "@/components/motion/MarketMarquee";
import { PinnedParallaxHero } from "@/components/motion/PinnedParallaxHero";
import { FrontShoeScrollRail } from "@/components/motion/FrontShoeScrollRail";
import { Layers } from "lucide-react";

const INITIAL_SAMPLE_VALUATION: PredictResponse = {
  brand: "Yeezy",
  sneaker_name: "Yeezy Boost 350 V2 Zebra",
  retail_price: 220.0,
  shoe_size: 10.5,
  days_since_release: 45,
  estimated_resale_price: 340.91,
  estimated_profit: 120.91,
  profit_margin_pct: 54.96,
  verdict: "COP",
};

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [supportedBrands, setSupportedBrands] = useState<string[]>([]);
  const [defaultRetailMap, setDefaultRetailMap] = useState<Record<string, number>>({});
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [activeValuation, setActiveValuation] = useState<PredictResponse | null>(INITIAL_SAMPLE_VALUATION);
  const [prefillData, setPrefillData] = useState<Partial<PredictPayload> | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [isRefreshingLedger, setIsRefreshingLedger] = useState<boolean>(false);

  // Initial load: Fetch health, brands, and recent history
  const loadInitialData = useCallback(async () => {
    try {
      const [hData, bData, histData] = await Promise.all([
        checkApiHealth(),
        fetchBrands(),
        fetchPredictionHistory(15),
      ]);
      setHealth(hData);
      setSupportedBrands(bData.brands);
      setDefaultRetailMap(bData.default_retail);
      if (histData.predictions && histData.predictions.length > 0) {
        setHistoryRecords(histData.predictions);
      }
    } catch (err) {
      console.error("[DropOrCop] Failed to load initial data", err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle manual health refresh
  const handleRefreshHealth = async () => {
    const h = await checkApiHealth();
    setHealth(h);
  };

  // Handle history ledger refresh
  const handleRefreshLedger = async () => {
    setIsRefreshingLedger(true);
    try {
      const histData = await fetchPredictionHistory(20);
      setHistoryRecords(histData.predictions);
    } finally {
      setIsRefreshingLedger(false);
    }
  };

  // Submit prediction handler
  const handleCalculateValuation = async (payload: PredictPayload) => {
    setIsPredicting(true);
    try {
      const res = await predictResale(payload);
      setActiveValuation(res);
      await handleRefreshLedger();
    } finally {
      setIsPredicting(false);
    }
  };

  // Handle re-test selection from history ledger
  const handleSelectRecordFromHistory = (rec: HistoryRecord) => {
    setPrefillData({
      brand: rec.brand,
      retail_price: rec.retail_price,
      shoe_size: rec.shoe_size,
      days_since_release: rec.days_since_release,
      sneaker_name: rec.sneaker_name || undefined,
    });
    const cockpitEl = document.getElementById("valuation-cockpit-section");
    if (cockpitEl) {
      cockpitEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle selection from Front Shoe Scroll Showcase Rail
  const handleSelectFromShowcase = async (payload: Partial<PredictPayload>) => {
    setPrefillData(payload);

    if (
      payload.brand &&
      payload.retail_price &&
      payload.shoe_size !== undefined &&
      payload.days_since_release !== undefined
    ) {
      setIsPredicting(true);
      try {
        const res = await predictResale({
          brand: payload.brand,
          retail_price: payload.retail_price,
          shoe_size: payload.shoe_size,
          days_since_release: payload.days_since_release,
          sneaker_name: payload.sneaker_name,
          threshold: 0.15,
        });
        setActiveValuation(res);
        await handleRefreshLedger();
      } catch {
        // Fallback valuation estimate if API temporarily unreached
        const estimatedResale = payload.retail_price * 1.55;
        const profit = estimatedResale - payload.retail_price;
        setActiveValuation({
          brand: payload.brand,
          sneaker_name: payload.sneaker_name,
          retail_price: payload.retail_price,
          shoe_size: payload.shoe_size,
          days_since_release: payload.days_since_release,
          estimated_resale_price: estimatedResale,
          estimated_profit: profit,
          profit_margin_pct: (profit / payload.retail_price) * 100,
          verdict: profit > 0 ? "COP" : "DROP",
        });
      } finally {
        setIsPredicting(false);
      }
    }

    const cockpitEl = document.getElementById("valuation-cockpit-section");
    if (cockpitEl) {
      cockpitEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToCockpit = () => {
    const cockpitEl = document.getElementById("valuation-cockpit-section");
    if (cockpitEl) {
      cockpitEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#bef264] selection:text-zinc-950 relative overflow-x-clip">
      {/* SVG Analog Filter Definitions */}
      <SquigglyFilter />

      {/* Global Header */}
      <Header health={health} onRefreshHealth={handleRefreshHealth} />

      {/* Pinned Parallax Hero with Scroll-Scrub Reveal */}
      <PinnedParallaxHero onExploreClick={handleScrollToCockpit} />

      {/* Hardware-Accelerated Continuous Market Ticker */}
      <MarketMarquee />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 relative z-10">
        {/* Prominent Front-of-UI Smooth Scrollable Sneaker Rail */}
        <section className="pt-2">
          <FrontShoeScrollRail onSelectSneaker={handleSelectFromShowcase} />
        </section>

        {/* 2-Column Valuation Cockpit Grid with 3D Holographic Tilt Stage */}
        <section
          id="valuation-cockpit-section"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-24 pt-4"
        >
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7">
            <ValuationCockpit
              supportedBrands={supportedBrands}
              defaultRetailMap={defaultRetailMap}
              onSubmit={handleCalculateValuation}
              isLoading={isPredicting}
              prefillData={prefillData}
            />
          </div>

          {/* Right Column: 3D Holographic Tilt Valuation Result Stage (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#bef264]" />
                <span>Arbitrage Appraisal & Verdict</span>
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Valuation Stage</span>
              </span>
            </div>
            <SneakerCard3D result={activeValuation} isLoading={isPredicting} />
          </div>
        </section>

        {/* Model Diagnostics Section */}
        <section>
          <ModelDiagnosticsCard />
        </section>

        {/* Real-Time Prediction Audit Ledger */}
        <section>
          <HistoryLedger
            records={historyRecords}
            onSelectRecord={handleSelectRecordFromHistory}
            onRefresh={handleRefreshLedger}
            isLoading={isRefreshingLedger}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-8 text-xs font-sans text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="text-zinc-300 font-bold uppercase tracking-wider">DropOrCop • Group G Project</span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span>Dept. of Computer Science & Engineering</span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span>Faculty Mentor: Megha Gupta</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-zinc-400">
            <span>Harsh Kumar (31)</span>
            <span>Anamika Ghosh (32)</span>
            <span>Sinthoiba Kangjam (34)</span>
            <span>Himesh Vaskar (35)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
