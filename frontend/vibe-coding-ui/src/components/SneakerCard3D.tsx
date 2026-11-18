"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Percent,
  Database,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { PredictResponse } from "@/lib/api";
import { AnimatedPriceCounter } from "./AnimatedPriceCounter";
import { HoloTiltCard } from "./motion/HoloTiltCard";

interface SneakerCard3DProps {
  result: PredictResponse | null;
  isLoading: boolean;
}

export function SneakerCard3D({ result, isLoading }: SneakerCard3DProps) {
  if (isLoading) {
    return (
      <HoloTiltCard className="w-full">
        <div className="w-full min-h-[520px] p-8 flex flex-col items-center justify-center text-center relative">
          <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800 border-t-[#bef264] animate-spin" />
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#bef264] animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-black text-white font-sans uppercase">
            Evaluating Random Forest Trees
          </h3>
          <p className="text-sm text-zinc-300 mt-2 max-w-sm font-sans leading-relaxed">
            Deriving hype keywords & calculating secondary market arbitrage yield...
          </p>
        </div>
      </HoloTiltCard>
    );
  }

  if (!result) {
    return (
      <HoloTiltCard className="w-full">
        <div className="w-full min-h-[520px] p-8 flex flex-col items-center justify-center text-center group">
          <div className="w-24 h-24 rounded-3xl bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center mb-6 text-zinc-400 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
            <Layers className="w-10 h-10 text-[#bef264]" />
          </div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#bef264] font-bold mb-1">
            // 3D INTERACTIVE VALUATION STAGE
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-sans uppercase">
            Awaiting Valuation Input
          </h3>
          <p className="text-sm sm:text-base text-zinc-300 mt-3 max-w-sm font-sans leading-relaxed">
            Select or configure a sneaker on the left to compute secondary market arbitrage yield.
          </p>
          <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            <Database className="w-4 h-4 text-[#bef264]" />
            <span>Trained on 94,355 StockX Transactions</span>
          </div>
        </div>
      </HoloTiltCard>
    );
  }

  const isCop = result.verdict === "COP";
  const originalPrice = result.retail_price;
  const estimatedResale = result.estimated_resale_price;
  const isHigher = estimatedResale > originalPrice;
  const diffAmount = Math.abs(estimatedResale - originalPrice);

  return (
    <HoloTiltCard className="w-full">
      <div className="w-full space-y-6">
        {/* Top Bar: Sneaker Name & COP/DROP Stamp */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 gap-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-1">
              // STOCKX VALUATION RESULT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
              {result.sneaker_name || `${result.brand} Release`}
            </h2>
          </div>

          {/* Verdict Stamp Badge */}
          <div
            style={{ filter: "url(#squiggly-0)" }}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border-2 text-base font-black font-mono tracking-wider shadow-xl ${
              isCop
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-400"
                : "bg-rose-950/80 border-rose-500 text-rose-400"
            }`}
          >
            {isCop ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>COP</span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-rose-400" />
                <span>DROP</span>
              </>
            )}
          </div>
        </div>

        {/* MENTOR EVALUATION BANNER (EXACT PHRASING REQUIRED BY FACULTY MENTOR) */}
        <div
          className={`p-5 rounded-2xl border-2 shadow-2xl transition-all ${
            isHigher
              ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/80 text-rose-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest font-black mb-1.5">
            <span className="text-zinc-400">// FACULTY EVALUATION DIRECTIVE</span>
            <span className={isHigher ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {isHigher ? "ABOVE ORIGINAL PRICE" : "BELOW ORIGINAL PRICE"}
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight flex items-center gap-2 flex-wrap mt-1">
            <span
              className={`px-3 py-1 rounded-xl text-lg font-black shadow-md ${
                isHigher ? "bg-emerald-500 text-zinc-950" : "bg-rose-500 text-white"
              }`}
            >
              {isHigher ? "COP" : "DROP"}
            </span>
            <span className="text-white">
              ; <strong className={isHigher ? "text-emerald-400 font-black" : "text-rose-400 font-black"}>${diffAmount.toFixed(2)}</strong> {isHigher ? "above the original price" : "below the original price"}
            </span>
          </div>
        </div>

        {/* Primary Metric: Estimated Resale Price */}
        <div className="py-2">
          <span className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-1">
            Estimated Resale Price (Secondary Market)
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
              <AnimatedPriceCounter value={result.estimated_resale_price} />
            </span>
            <span className="text-base font-mono text-zinc-400 font-bold">USD ($)</span>
          </div>
        </div>

        {/* 2-Column Financial Breakdown */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-zinc-800/80">
          {/* Net Profit / Loss */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1 font-bold flex items-center gap-1.5">
              {result.estimated_profit >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              )}
              Net Profit / Loss
            </span>
            <span
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                result.estimated_profit >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {result.estimated_profit >= 0 ? "+" : ""}
              ${result.estimated_profit.toFixed(2)}
            </span>
          </div>

          {/* ROI Margin % */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1 font-bold flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-[#bef264]" />
              Margin on Retail (ROI)
            </span>
            <span
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                result.estimated_profit >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {result.estimated_profit >= 0 ? "+" : ""}
              {result.profit_margin_pct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Baseline Input Attribute Summary Chips */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80 text-center">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">Original Shop Price</span>
            <span className="text-base font-mono font-black text-white mt-0.5 block">
              ${result.retail_price.toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">US Shoe Size</span>
            <span className="text-base font-mono font-black text-white mt-0.5 block">
              {result.shoe_size.toFixed(1)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">Holding Period</span>
            <span className="text-base font-mono font-black text-white mt-0.5 block">
              {result.days_since_release} Days
            </span>
          </div>
        </div>
      </div>
    </HoloTiltCard>
  );
}
