"use client";

import React from "react";
import { Layers, TriangleAlert } from "lucide-react";
import type { PredictResponse } from "@/lib/api";
import { AnimatedPriceCounter } from "./AnimatedPriceCounter";
import { HoloTiltCard } from "./motion/HoloTiltCard";

interface SneakerCard3DProps {
  result: PredictResponse | null;
  isLoading: boolean;
  /** ROI hurdle the verdict was computed against, as a fraction (0.15 = 15%). */
  threshold?: number;
}

function plainEnglishLine(result: PredictResponse, hurdlePct: number): string {
  const profit = result.estimated_profit;
  const targetProfit = result.retail_price * hurdlePct / 100;
  if (result.verdict === "COP") {
    const marginOverTarget = Math.max(0, profit - targetProfit);
    return `Expected resale clears your ${hurdlePct}% target by $${marginOverTarget.toFixed(2)}. Worth buying at this price.`;
  }
  if (profit >= 0) {
    return `Resale is expected above retail, but it misses your ${hurdlePct}% target. Pass at this price.`;
  }
  return `Expected resale is $${Math.abs(profit).toFixed(2)} below retail. Pass at this price.`;
}

export function SneakerCard3D({ result, isLoading, threshold = 0.15 }: SneakerCard3DProps) {
  if (isLoading) {
    return (
      <HoloTiltCard className="w-full">
        <div className="flex min-h-[320px] items-center justify-center" aria-live="polite">
          <p className="text-14 text-ink-3">Running the model…</p>
        </div>
      </HoloTiltCard>
    );
  }

  if (!result) {
    return (
      <HoloTiltCard className="w-full">
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <div className="mb-5 grid size-12 place-items-center rounded-card border border-hairline bg-inset">
            <Layers className="size-5 text-accent-readable" aria-hidden="true" />
          </div>
          <p className="text-12 font-semibold uppercase tracking-[0.16em] text-accent-readable">Verdict</p>
          <h3 className="mt-1 text-22 font-extrabold tracking-tight text-ink-1">
            Ready when you are
          </h3>
          <p className="mt-2 max-w-xs text-14 leading-relaxed text-ink-3">
            Check a pair to see the predicted resale price and a clear COP or DROP verdict.
          </p>
        </div>
      </HoloTiltCard>
    );
  }

  const isCop = result.verdict === "COP";
  const hurdlePct = Math.round(threshold * 100);
  const profit = result.estimated_profit;

  return (
    <HoloTiltCard className="w-full">
      <div className="space-y-4" role="status" aria-live="polite">
        <div className="border-b border-hairline pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {result.is_estimate && (
              <span className="inline-flex items-center gap-1.5 rounded-card border border-warn/40 bg-warn/10 px-2 py-1 text-12 font-semibold text-warn">
                <TriangleAlert className="size-3.5" aria-hidden="true" />
                Offline estimate
              </span>
            )}
            {result.is_extrapolated && (
              <span className="rounded-card border border-warn/40 bg-warn/10 px-2 py-1 text-12 font-semibold text-warn">
                Extrapolated brand
              </span>
            )}
          </div>
          <p className="mt-2 text-12 text-ink-3">{result.brand}</p>
          <h3 className="text-18 font-bold leading-snug text-ink-1">
            {result.sneaker_name || `${result.brand} pair`}
          </h3>
          <p className="mt-1 font-mono text-12 tabular text-ink-3">
            Retail ${result.retail_price.toFixed(2)} · US {result.shoe_size.toFixed(1)} · {result.days_since_release}d
          </p>
        </div>

        <div
          className={`rounded-panel border p-4 ${
            isCop ? "border-cop/50 bg-cop/10" : "border-drop/50 bg-drop/10"
          }`}
        >
          <span
            className={`inline-flex items-center rounded-card px-4 py-2 text-22 font-extrabold tracking-[0.08em] ${
              isCop ? "bg-cop text-cop-ink" : "bg-drop text-drop-ink"
            }`}
          >
            {result.verdict}
          </span>
          <p className={`mt-3 text-14 font-semibold ${isCop ? "text-cop" : "text-drop"}`}>
            {isCop ? "Clears your target" : profit >= 0 ? "Below your target" : "Below retail"}
          </p>
        </div>

        <div className="rounded-panel border border-hairline bg-inset p-4">
          <p className="text-12 font-semibold uppercase tracking-[0.16em] text-ink-3">
            Predicted resale
          </p>
          <p className="mt-1 text-40 font-extrabold tracking-tight text-ink-1">
            <AnimatedPriceCounter value={result.estimated_resale_price} />
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-card border border-hairline bg-inset p-3">
            <p className="text-12 text-ink-3">Net P/L</p>
            <p className={`mt-1 font-mono text-22 font-bold tabular ${profit >= 0 ? "text-cop" : "text-drop"}`}>
              {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
            </p>
          </div>
          <div className="rounded-card border border-hairline bg-inset p-3">
            <p className="text-12 text-ink-3">ROI</p>
            <p className={`mt-1 font-mono text-22 font-bold tabular ${profit >= 0 ? "text-cop" : "text-drop"}`}>
              {profit >= 0 ? "+" : ""}{result.profit_margin_pct.toFixed(1)}%
            </p>
          </div>
        </div>

        <p className="text-14 leading-relaxed text-ink-2">{plainEnglishLine(result, hurdlePct)}</p>
      </div>
    </HoloTiltCard>
  );
}
