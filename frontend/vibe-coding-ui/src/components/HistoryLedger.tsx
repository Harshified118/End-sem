"use client";

import React from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import type { HistoryRecord } from "@/lib/api";

interface HistoryLedgerProps {
  records: HistoryRecord[];
  /** Total rows persisted in the database (higher than the visible page). */
  totalCount?: number;
  /** True when the backend is unreachable, so the table may be stale/empty. */
  isOffline?: boolean;
  onSelectRecord: (record: HistoryRecord) => void;
  onRefresh: () => void;
  isLoading: boolean;
  /** Optional call to jump the user back up to the cockpit. */
  onStart?: () => void;
}

function formatTimestamp(raw: string): string {
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const hasZone = /(Z|[+-]\d{2}:\d{2})$/.test(normalized);
  const date = new Date(hasZone ? normalized : `${normalized}Z`);
  if (Number.isNaN(date.getTime())) return raw;

  const diffMin = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function HistoryLedger({
  records,
  totalCount,
  isOffline = false,
  onSelectRecord,
  onRefresh,
  isLoading,
  onStart,
}: HistoryLedgerProps) {
  const totalRows = typeof totalCount === "number" ? totalCount : records.length;

  return (
    <section aria-label="past checks" className="material-card w-full p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <p className="text-12 font-semibold uppercase tracking-[0.16em] text-accent-readable">History</p>
          <h3 className="mt-0.5 text-22 font-extrabold tracking-tight text-ink-1">Past checks</h3>
          <p className="mt-1 text-12 text-ink-3">
            {totalRows} saved {totalRows === 1 ? "check" : "checks"} · pick a row to re-run it.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh past checks"
          className="inline-flex items-center gap-2 rounded-card border border-hairline bg-inset px-3 py-2 text-12 font-semibold text-ink-3 transition-colors hover:text-ink-1 disabled:opacity-50"
        >
          <RotateCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </button>
      </div>



      {records.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-14 text-ink-3">No checks saved yet.</p>
          {onStart && (
            <button
              type="button"
              onClick={onStart}
              className="rounded-card bg-accent px-4 py-2 text-14 font-bold text-on-accent"
            >
              Check a pair
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[640px] text-left text-14">
              <caption className="sr-only">
                Past checks with timestamp, model, retail price, predicted resale, profit and return.
              </caption>
              <thead>
                <tr className="border-b border-hairline text-12 text-ink-3">
                  <th scope="col" className="px-2 py-3 font-semibold">When</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Model</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Retail</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Predicted</th>
                  <th scope="col" className="px-2 py-3 font-semibold">P/L</th>
                  <th scope="col" className="px-2 py-3 font-semibold">ROI</th>
                  <th scope="col" className="px-2 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {records.map((item) => {
                  const positive = item.profit >= 0;
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-2 py-3 font-mono text-12 tabular text-ink-3">
                        {formatTimestamp(item.timestamp)}
                      </td>
                      <td className="max-w-[220px] px-2 py-3">
                        <p className="truncate font-semibold text-ink-1">{item.sneaker_name || item.brand}</p>
                        <p className="text-12 text-ink-3">{item.brand}</p>
                      </td>
                      <td className="px-2 py-3 font-mono text-12 tabular text-ink-2">${item.retail_price.toFixed(2)}</td>
                      <td className="px-2 py-3 font-mono text-12 font-bold tabular text-ink-1">${item.estimated_resale_price.toFixed(2)}</td>
                      <td className={`px-2 py-3 font-mono text-12 tabular ${positive ? "text-cop" : "text-drop"}`}>
                        {positive ? "+" : ""}${item.profit.toFixed(2)}
                      </td>
                      <td className={`px-2 py-3 font-mono text-12 tabular ${positive ? "text-cop" : "text-drop"}`}>
                        {item.margin_pct >= 0 ? "+" : ""}{item.margin_pct.toFixed(1)}%
                      </td>
                      <td className="px-2 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectRecord(item)}
                          aria-label={`re-run check for ${item.sneaker_name || item.brand}`}
                          className="rounded-card border border-hairline bg-inset px-2.5 py-1.5 text-12 font-semibold text-ink-2 transition-colors hover:text-accent-readable"
                        >
                          Re-run
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-2 sm:hidden">
            {records.map((item) => {
              const positive = item.profit >= 0;
              return (
                <li key={item.id} className="rounded-card border border-hairline bg-inset p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-14 font-bold text-ink-1">{item.sneaker_name || item.brand}</p>
                      <p className="text-12 text-ink-3">
                        {item.brand} · {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectRecord(item)}
                      aria-label={`re-run check for ${item.sneaker_name || item.brand}`}
                      className="shrink-0 rounded-card border border-hairline bg-canvas px-2.5 py-1.5 text-12 font-semibold text-ink-2"
                    >
                      Re-run
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-12 tabular">
                    <p className="text-ink-3">Retail ${item.retail_price.toFixed(2)}</p>
                    <p className="text-ink-1">Predicted ${item.estimated_resale_price.toFixed(2)}</p>
                    <p className={positive ? "text-cop" : "text-drop"}>
                      P/L {positive ? "+" : ""}${item.profit.toFixed(2)}
                    </p>
                    <p className={positive ? "text-cop" : "text-drop"}>
                      ROI {item.margin_pct >= 0 ? "+" : ""}{item.margin_pct.toFixed(1)}%
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
