"use client";

import React, { useState } from "react";
import { HistoryRecord } from "@/lib/api";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCw,
  Search,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";

interface HistoryLedgerProps {
  records: HistoryRecord[];
  onSelectRecord: (record: HistoryRecord) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function HistoryLedger({
  records,
  onSelectRecord,
  onRefresh,
  isLoading,
}: HistoryLedgerProps) {
  const [filter, setFilter] = useState<"ALL" | "COP" | "DROP">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredRecords = records.filter((r) => {
    if (filter === "COP" && r.verdict !== "COP") return false;
    if (filter === "DROP" && r.verdict !== "DROP") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBrand = r.brand.toLowerCase().includes(q);
      const matchName = r.sneaker_name?.toLowerCase().includes(q);
      return matchBrand || matchName;
    }
    return true;
  });

  return (
    <div className="w-full bg-[#10121a]/90 border border-white/[0.08] rounded-2xl p-6 lg:p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#bef264]" />
            <h3 className="text-base font-semibold text-white font-sans tracking-tight">
              Prediction Audit Ledger
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
              {records.length} Recorded
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time feed from SQLite database (`data/droporcop.db`). Click any item to load into cockpit.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {/* Filter Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {(["ALL", "COP", "DROP"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  filter === tab
                    ? "bg-[#bef264] text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh database ledger"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="py-4 border-b border-white/[0.06]">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search recent valuations by model or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#bef264] transition-colors font-sans"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="mt-4 overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-sans">
            No valuation records found matching filter. Run a prediction above to log to SQLite database.
          </div>
        ) : (
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Verdict</th>
                <th className="py-3 px-3">Sneaker Model</th>
                <th className="py-3 px-3">Retail MSRP</th>
                <th className="py-3 px-3">Predicted Resale</th>
                <th className="py-3 px-3">Net Profit</th>
                <th className="py-3 px-3">ROI Margin</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredRecords.map((item) => {
                const isCop = item.verdict === "COP";
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider ${
                          isCop
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {isCop ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-400" />
                        )}
                        {item.verdict}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-white">
                      <div>{item.sneaker_name || item.brand}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.brand} • Size {item.shoe_size} • {item.days_since_release}d
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      ${item.retail_price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-white">
                      ${item.estimated_resale_price.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono font-medium ${
                        item.profit >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {item.profit >= 0 ? "+" : ""}${item.profit.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono ${
                        item.margin_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {item.margin_pct >= 0 ? "+" : ""}{item.margin_pct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectRecord(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-[#bef264]/10 hover:border-[#bef264]/40 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-[11px] font-mono cursor-pointer"
                        title="Load this sneaker's parameters into cockpit"
                      >
                        <span>Re-test</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
