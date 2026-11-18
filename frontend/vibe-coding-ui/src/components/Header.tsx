"use client";

import React from "react";
import { Sparkles, Terminal, ShieldCheck, AlertCircle } from "lucide-react";
import { HealthResponse } from "@/lib/api";

interface HeaderProps {
  health: HealthResponse | null;
  onRefreshHealth: () => void;
}

export function Header({ health, onRefreshHealth }: HeaderProps) {
  const isHealthy = health?.status === "healthy" && health?.model_loaded;

  return (
    <header className="w-full border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white shadow-sm ring-1 ring-white/5">
            <Sparkles className="w-5 h-5 text-[#bef264]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white font-sans uppercase">
                Drop<span className="text-zinc-500">Or</span>Cop
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-[#bef264] border border-zinc-700 font-bold tracking-wider">
                ML v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans hidden sm:block">
              Sneaker Resale Profit Arbitrage Predictor
            </p>
          </div>
        </div>

        {/* Status Indicators & Metadata */}
        <div className="flex items-center gap-3">
          {/* Live Engine Status Pill */}
          <button
            onClick={onRefreshHealth}
            title="Click to re-ping FastAPI backend"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all cursor-pointer ${
              isHealthy
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40"
                : "bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-900/40"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isHealthy ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isHealthy ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
            </span>
            <span className="font-medium">
              {isHealthy ? "API Online (Port 8000)" : "API Disconnected"}
            </span>
          </button>

          {/* Academic Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#bef264]" />
            <span>Group G • CSE End-Sem</span>
          </div>

          {/* API Docs Link */}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-sans text-zinc-200 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">FastAPI Docs</span>
          </a>
        </div>
      </div>
    </header>
  );
}
