"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export interface MarqueeItem {
  pair: string;
  change: string;
  isPositive: boolean;
  volume: string;
}

const DEFAULT_MARQUEE_ITEMS: MarqueeItem[] = [
  { pair: "OFF-WHITE x AIR JORDAN 1 'CHICAGO'", change: "+142.8%", isPositive: true, volume: "$4,250" },
  { pair: "YEEZY BOOST 350 V2 'ZEBRA'", change: "+54.9%", isPositive: true, volume: "$340" },
  { pair: "TRAVIS SCOTT x AJ1 LOW 'REVERSE MOCHA'", change: "+188.4%", isPositive: true, volume: "$1,150" },
  { pair: "NIKE DUNK LOW RETRO 'PANDA'", change: "+22.1%", isPositive: true, volume: "$135" },
  { pair: "NEW BALANCE 990v5 'GREY CASTLE'", change: "+14.6%", isPositive: true, volume: "$210" },
  { pair: "OFF-WHITE x NIKE AIR PRESTO 'BLACK'", change: "+96.3%", isPositive: true, volume: "$880" },
];

export function MarketMarquee({ items = DEFAULT_MARQUEE_ITEMS }: { items?: MarqueeItem[] }) {
  const displayItems = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-y border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md py-2.5 relative select-none">
      <div className="flex items-center gap-2 px-4 absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent pr-8">
        <Activity className="w-3.5 h-3.5 text-[#bef264] animate-pulse" />
        <span className="text-[10px] font-mono uppercase tracking-widest font-black text-zinc-300 whitespace-nowrap">
          STOCKX REAL-TIME SPREAD TICKER
        </span>
      </div>

      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] pl-72">
        {displayItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-6 text-xs font-mono border-r border-zinc-800/50 whitespace-nowrap"
          >
            <span className="font-semibold text-zinc-300">{item.pair}</span>
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                item.isPositive
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                  : "bg-rose-950/60 text-rose-400 border border-rose-800/50"
              }`}
            >
              {item.isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {item.change}
            </span>
            <span className="text-zinc-500 font-normal">{item.volume}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
