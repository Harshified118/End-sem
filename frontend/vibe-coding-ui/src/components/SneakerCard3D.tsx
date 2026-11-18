"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Percent,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  DollarSign,
  ShieldCheck,
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
        <div className="w-full min-h-[500px] p-8 flex flex-col items-center justify-center text-center relative">
          <div className="relative flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800 border-t-[#bef264] animate-spin" />
            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#bef264] animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white font-sans tracking-tight">
            Valuating Sneaker Resale...
          </h3>
          <p className="text-sm text-zinc-400 mt-2 max-w-xs font-sans leading-relaxed">
            Running Random Forest model across historical StockX transactions...
          </p>
        </div>
      </HoloTiltCard>
    );
  }

  if (!result) {
    return (
      <HoloTiltCard className="w-full">
        <div className="w-full min-h-[500px] p-8 flex flex-col items-center justify-center text-center group">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-400 group-hover:scale-105 transition-transform duration-300 shadow-xl">
            <Layers className="w-9 h-9 text-[#bef264]" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#bef264] mb-2">
            Valuation Engine Ready
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-tight">
            Select or Configure a Sneaker
          </h3>
          <p className="text-sm text-zinc-400 mt-2 max-w-sm font-sans leading-relaxed">
            Choose a sneaker on the left to calculate expected resale price, profit spread, and get an instant COP or DROP investment verdict.
          </p>
          <div className="mt-8 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#bef264]" />
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
        {/* Top Header: Sneaker Model & Category */}
        <div className="pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 font-sans">
            <Tag className="w-3.5 h-3.5 text-[#bef264]" />
            <span>Valuation Result • StockX Secondary Market</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-sans tracking-tight leading-snug">
            {result.sneaker_name || `${result.brand} Edition`}
          </h2>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-sans">
            <span>Retail MSRP: <strong className="text-zinc-200 font-mono font-bold">${originalPrice.toFixed(2)}</strong></span>
            <span>•</span>
            <span>Size: <strong className="text-zinc-200 font-mono font-bold">US {result.shoe_size.toFixed(1)}</strong></span>
            <span>•</span>
            <span>Holding: <strong className="text-zinc-200 font-mono font-bold">{result.days_since_release}d</strong></span>
          </div>
        </div>

        {/* HERO VERDICT BANNER: Instantly Recognizable at a Single Glance */}
        <div
          className={`p-5 rounded-2xl border-2 transition-all shadow-xl relative overflow-hidden ${
            isCop
              ? "bg-gradient-to-br from-emerald-950/80 via-emerald-950/40 to-zinc-950 border-emerald-500/80 shadow-emerald-950/40"
              : "bg-gradient-to-br from-rose-950/80 via-rose-950/40 to-zinc-950 border-rose-500/80 shadow-rose-950/40"
          }`}
        >
          {/* Top Row: Prominent Verdict Badge + Signal Pill */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-base font-extrabold font-sans tracking-wider shadow-md ${
                  isCop
                    ? "bg-emerald-500 text-zinc-950"
                    : "bg-rose-500 text-white"
                }`}
              >
                {isCop ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-zinc-950" />
                    <span>COP</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-white" />
                    <span>DROP</span>
                  </>
                )}
              </span>

              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border font-sans ${
                  isCop
                    ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/80 border-rose-500/40 text-rose-300"
                }`}
              >
                {isCop ? "Profitable Flip" : "High Risk / Loss"}
              </span>
            </div>

            <span className="text-xs font-semibold text-zinc-400 font-sans">
              {isHigher ? "Above Retail MSRP" : "Below Retail MSRP"}
            </span>
          </div>

          {/* Core Decision Summary in 1 Clear Sentence */}
          <div className="mt-3.5 pt-3 border-t border-white/10">
            <div className="text-base sm:text-lg font-bold text-white tracking-tight flex items-baseline gap-1.5 flex-wrap font-sans">
              <span>Expected resale is</span>
              <strong className={`font-mono font-extrabold ${isHigher ? "text-emerald-400" : "text-rose-400"}`}>
                ${diffAmount.toFixed(2)}
              </strong>
              <span>{isHigher ? "above the original price" : "below the original price"}.</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 font-sans leading-normal">
              {isCop
                ? `Yields +$${result.estimated_profit.toFixed(2)} net profit (+${result.profit_margin_pct.toFixed(1)}% ROI). Strong buy recommendation.`
                : `Estimated resale yields -$${diffAmount.toFixed(2)} loss below retail price. High depreciation risk — skip purchase.`}
            </p>
          </div>
        </div>

        {/* PRIMARY VALUATION NUMBER */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
          <span className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-400 block mb-1">
            Predicted Resale Price
          </span>
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              <AnimatedPriceCounter value={result.estimated_resale_price} />
            </span>
            <span className="text-sm font-bold text-zinc-400 font-mono">USD</span>
          </div>
        </div>

        {/* 2-Column Financial Impact: Net Profit & ROI Margin */}
        <div className="grid grid-cols-2 gap-4">
          {/* Net Profit / Loss */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              {result.estimated_profit >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              )}
              <span>Net Profit</span>
            </div>
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight block ${
                result.estimated_profit >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {result.estimated_profit >= 0 ? "+" : ""}
              ${result.estimated_profit.toFixed(2)}
            </span>
          </div>

          {/* ROI Margin % */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold font-sans uppercase tracking-wider text-zinc-400 mb-1">
              <Percent className="w-4 h-4 text-[#bef264]" />
              <span>ROI Margin</span>
            </div>
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight block ${
                result.estimated_profit >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {result.estimated_profit >= 0 ? "+" : ""}
              {result.profit_margin_pct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Baseline Input Summary */}
        <div className="grid grid-cols-3 gap-3 pt-1 text-center">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[11px] font-medium font-sans text-zinc-400 block">Retail Price</span>
            <span className="text-sm font-bold font-mono text-zinc-100 mt-0.5 block">
              ${result.retail_price.toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[11px] font-medium font-sans text-zinc-400 block">Shoe Size</span>
            <span className="text-sm font-bold font-mono text-zinc-100 mt-0.5 block">
              US {result.shoe_size.toFixed(1)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[11px] font-medium font-sans text-zinc-400 block">Holding Age</span>
            <span className="text-sm font-bold font-mono text-zinc-100 mt-0.5 block">
              {result.days_since_release} Days
            </span>
          </div>
        </div>
      </div>
    </HoloTiltCard>
  );
}
