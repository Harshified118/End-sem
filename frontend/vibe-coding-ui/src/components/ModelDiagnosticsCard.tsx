"use client";

import React, { useState } from "react";
import { ChevronDown, Cpu } from "lucide-react";

const METRICS = [
  { label: "R²", value: "0.6271", hint: "variance explained" },
  { label: "MAE", value: "$89.38", hint: "mean absolute error" },
  { label: "Holdout", value: "19,938", hint: "test transactions" },
];

export function ModelDiagnosticsCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section aria-label="model info" className="material-card w-full p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-card border border-accent/30 bg-accent/10">
            <Cpu className="size-4 text-accent-readable" aria-hidden="true" />
          </div>
          <div>
            <p className="text-12 font-semibold uppercase tracking-[0.16em] text-accent-readable">Model info</p>
            <h3 className="mt-0.5 text-18 font-bold text-ink-1">
              What the model actually scored
            </h3>
            <p className="mt-1 text-12 text-ink-3">
              Retrained ExtraTrees ensemble on an independent 20% StockX holdout.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="model-info-panel"
          className="flex items-center gap-1.5 rounded-card border border-hairline bg-inset px-3 py-2 text-12 font-semibold text-ink-3 transition-colors hover:text-ink-1"
        >
          {isOpen ? "Hide details" : "Model details"}
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${isOpen ? "[transform:rotate(180deg)]" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {METRICS.map((metric) => (
          <div key={metric.label} className="rounded-card border border-hairline bg-inset px-4 py-3">
            <p className="text-12 text-ink-3">{metric.label}</p>
            <p className="mt-0.5 font-mono text-22 font-bold tabular text-ink-1">{metric.value}</p>
            <p className="mt-0.5 text-12 text-ink-3">{metric.hint}</p>
          </div>
        ))}
      </div>

      {isOpen && (
        <div id="model-info-panel" className="mt-4 border-t border-hairline pt-4">
          <div className="grid grid-cols-1 gap-3 text-14 leading-relaxed text-ink-2 sm:grid-cols-2">
            <p>
              The project README still lists an earlier evaluation. The retrained values above are
              current and are the figures used on this page.
            </p>
            <p>
              A residual is the gap between a predicted resale price and the actual sale. The model
              is strongest on brands it trained on; treat prices for other brands as rough guides.
              The holdout is separate from the 2023 real-world check set.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
