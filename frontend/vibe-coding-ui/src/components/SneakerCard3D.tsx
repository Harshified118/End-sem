"use client";

import React, { useRef, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Percent,
  Database,
  HelpCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { PredictResponse } from "@/lib/api";
import { AnimatedPriceCounter } from "./AnimatedPriceCounter";

interface SneakerCard3DProps {
  result: PredictResponse | null;
  isLoading: boolean;
}

export function SneakerCard3D({ result, isLoading }: SneakerCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate rotation between -12 and 12 degrees
    const rX = -((mouseY - height / 2) / (height / 2)) * 10;
    const rY = ((mouseX - width / 2) / (width / 2)) * 10;

    setRotateX(rX);
    setRotateY(rY);

    // Calculate glare percentage
    const gX = (mouseX / width) * 100;
    const gY = (mouseY / height) * 100;
    setGlarePosition({ x: gX, y: gY, opacity: 0.15 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[480px] bg-[#10121a] border border-white/[0.08] rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="relative flex items-center justify-center w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
          <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
        </div>
        <h3 className="text-base font-semibold text-white font-sans">
          Evaluating Random Forest Trees
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-xs font-sans">
          Deriving hype indicator vectors & running regression inference...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.15s ease-out",
        }}
        className="w-full h-full min-h-[480px] bg-[#10121a] border border-white/[0.08] rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-crosshair select-none"
      >
        {/* Specular glare layer */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 350px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glarePosition.opacity}), transparent)`,
          }}
        />

        <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center mb-5 text-slate-400 group-hover:scale-110 transition-transform duration-300 shadow-xl">
          <Layers className="w-8 h-8 text-white" />
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold mb-1">
          // 3D INTERACTIVE VALUATION STAGE
        </div>
        <h3 className="text-base font-semibold text-white font-sans">
          Awaiting Valuation Input
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm font-sans leading-relaxed">
          Hover and tilt to explore 3D stage. Select or configure a sneaker on the left to compute secondary market arbitrage yield.
        </p>
        <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400">
          <Database className="w-3.5 h-3.5 text-zinc-300" />
          <span>Trained on 94,355 StockX Transactions</span>
        </div>
      </div>
    );
  }

  const isCop = result.verdict === "COP";
  const profitPositive = result.estimated_profit >= 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className={`w-full bg-[#10121a] border rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-2xl transition-shadow select-none ${
        isCop ? "border-emerald-500/40 glow-cop" : "border-rose-500/40 glow-drop"
      }`}
    >
      {/* Specular glare layer */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 400px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glarePosition.opacity}), transparent)`,
        }}
      />

      {/* Top Bar: Verdict Badge */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-1">
            // STOCKX VALUATION VERDICT
          </span>
          <h2 className="text-lg font-bold text-white font-sans tracking-tight">
            {result.sneaker_name || `${result.brand} Release`}
          </h2>
        </div>

        {/* Verdict Stamp Badge */}
        <div
          style={{ filter: "url(#squiggly-0)" }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-black font-mono tracking-wider shadow-lg ${
            isCop
              ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
              : "bg-rose-500/15 border-rose-500/50 text-rose-400"
          }`}
        >
          {isCop ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>COP (BUY)</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>DROP (SKIP)</span>
            </>
          )}
        </div>
      </div>

      {/* Valuation Primary Metric with Animated Rolling Counter */}
      <div className="py-6 border-b border-white/[0.08]">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
          Predicted Resale Price (Secondary Market)
        </span>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl lg:text-5xl font-extrabold text-white font-mono tracking-tight">
            <AnimatedPriceCounter value={result.estimated_resale_price} />
          </span>
          <span className="text-xs font-mono text-slate-400">USD</span>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 py-6 border-b border-white/[0.08]">
        {/* Estimated Profit */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
            {profitPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
            Estimated Net Profit
          </span>
          <span
            className={`text-2xl font-bold font-mono tracking-tight ${
              profitPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {profitPositive ? "+" : ""}
            ${result.estimated_profit.toFixed(2)}
          </span>
        </div>

        {/* Profit Margin % */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-zinc-300" />
            Return on Retail (ROI)
          </span>
          <span
            className={`text-2xl font-bold font-mono tracking-tight ${
              profitPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {profitPositive ? "+" : ""}
            {result.profit_margin_pct.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Baseline Context Chips */}
      <div className="grid grid-cols-3 gap-2 py-4 border-b border-white/[0.08] text-center">
        <div className="p-2 rounded-lg bg-white/[0.02]">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Retail MSRP</span>
          <span className="text-xs font-mono font-semibold text-slate-200">
            ${result.retail_price.toFixed(2)}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.02]">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Size (US)</span>
          <span className="text-xs font-mono font-semibold text-slate-200">
            US {result.shoe_size.toFixed(1)}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.02]">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Elapsed Days</span>
          <span className="text-xs font-mono font-semibold text-slate-200">
            {result.days_since_release}d
          </span>
        </div>
      </div>

      {/* Technical Rationale Banner */}
      <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed font-sans">
          {isCop ? (
            <p>
              <strong className="text-emerald-400 font-semibold">Recommendation: COP (Buy).</strong> Estimated resale yields a profit margin of{" "}
              <strong>+{result.profit_margin_pct.toFixed(1)}%</strong> (${result.estimated_profit.toFixed(2)}), exceeding your configured hurdle rate. Positive arbitrage spread.
            </p>
          ) : (
            <p>
              <strong className="text-rose-400 font-semibold">Recommendation: DROP (Skip).</strong> Estimated yield of{" "}
              <strong>{result.profit_margin_pct.toFixed(1)}%</strong> (${result.estimated_profit.toFixed(2)}) is below the target hurdle threshold. Buying carries capital depreciation risk.
            </p>
          )}
        </div>
      </div>

      {/* SQLite Log Confirmation */}
      <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-emerald-400" />
          Prediction recorded to data/droporcop.db
        </span>
        <span className="text-[10px] uppercase tracking-wider">3D Tilt Active</span>
      </div>
    </div>
  );
}
