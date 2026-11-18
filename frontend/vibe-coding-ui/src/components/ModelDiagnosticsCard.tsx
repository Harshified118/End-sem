"use client";

import React, { useState } from "react";
import { Cpu, ChevronDown, ChevronUp, CheckCircle, BarChart3, ShieldCheck } from "lucide-react";

export function ModelDiagnosticsCard() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="w-full bg-[#10121a]/60 border border-white/[0.06] rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#bef264]/10 border border-[#bef264]/20 text-[#bef264]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white font-sans flex items-center gap-2">
              <span>Phase 4 ML Pipeline & Model Diagnostics</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                Verified R² = 0.6525
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Evaluated on 18,871 holdout test transactions • Group G Academic Benchmark
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Toggle diagnostics details"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                Model Architecture
              </span>
              <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                Random Forest
              </span>
              <span className="text-[10px] text-slate-400">OneHot + StandardScaler</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                Explained Variance
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                R² = 0.6525
              </span>
              <span className="text-[10px] text-slate-400">65.3% price variance</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                Mean Abs. Error (MAE)
              </span>
              <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                $88.69 USD
              </span>
              <span className="text-[10px] text-slate-400">RMSE = $143.71</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                Directional Accuracy
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                99.02%
              </span>
              <span className="text-[10px] text-slate-400">COP/DROP classification</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 bg-white/[0.01] p-3 rounded-xl border border-white/[0.04] gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#bef264]" />
              Automated Test Suite: 31/31 unit & stress tests passing
            </span>
            <span className="text-slate-500">
              Artifact: models/best_model.joblib (1.1 MB)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
