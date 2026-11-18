"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import { HoloTiltCard } from "./HoloTiltCard";
import { PredictPayload } from "@/lib/api";

export interface ShowcaseSneaker {
  id: string;
  name: string;
  brand: string;
  retail: number;
  size: number;
  days: number;
  spread: string;
  tag: string;
  avgResale: number;
  silhouetteColor: string;
}

const SHOWCASE_ITEMS: ShowcaseSneaker[] = [
  {
    id: "ow-chicago",
    name: "Off-White x Air Jordan 1 Chicago",
    brand: "Off-White",
    retail: 190,
    size: 10.5,
    days: 120,
    spread: "+142.8%",
    tag: "GRAIL // THE TEN",
    avgResale: 4250,
    silhouetteColor: "#ef4444",
  },
  {
    id: "yzy-350-zebra",
    name: "Yeezy Boost 350 V2 Zebra",
    brand: "Yeezy",
    retail: 220,
    size: 10.5,
    days: 45,
    spread: "+54.9%",
    tag: "HIGH LIQUIDITY",
    avgResale: 340,
    silhouetteColor: "#e4e4e7",
  },
  {
    id: "ts-reverse-mocha",
    name: "Travis Scott x AJ1 Reverse Mocha",
    brand: "Jordan",
    retail: 150,
    size: 10.0,
    days: 90,
    spread: "+188.4%",
    tag: "CACTUS JACK",
    avgResale: 1150,
    silhouetteColor: "#d97706",
  },
  {
    id: "dunk-panda",
    name: "Nike Dunk Low Retro Panda",
    brand: "Nike",
    retail: 115,
    size: 9.5,
    days: 30,
    spread: "+22.1%",
    tag: "HIGH VOLUME",
    avgResale: 140,
    silhouetteColor: "#71717a",
  },
  {
    id: "nb-990v5",
    name: "New Balance 990v5 Grey",
    brand: "New Balance",
    retail: 185,
    size: 10.5,
    days: 60,
    spread: "+16.2%",
    tag: "HERITAGE RUN",
    avgResale: 215,
    silhouetteColor: "#9ca3af",
  },
  {
    id: "ow-presto",
    name: "Off-White x Nike Air Presto",
    brand: "Off-White",
    retail: 160,
    size: 10.0,
    days: 180,
    spread: "+96.3%",
    tag: "GRAIL // VIRGIL",
    avgResale: 880,
    silhouetteColor: "#10b981",
  },
];

interface FrontShoeScrollRailProps {
  onSelectSneaker: (payload: Partial<PredictPayload>) => void;
}

export function FrontShoeScrollRail({ onSelectSneaker }: FrontShoeScrollRailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 360;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full space-y-4 relative py-4 select-none">
      {/* Section Header with Glide Navigation Arrows */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#bef264] animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#bef264] font-bold">
              FEATURED SPECIMENS • SMOOTH SCROLL RAIL
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans mt-0.5">
            Secondary Market Arbitrage Watchlist
          </h2>
        </div>

        {/* Directional Glide Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll("left")}
            aria-label="Scroll Rail Left"
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            aria-label="Scroll Rail Right"
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Smooth Snap Scroll Track */}
      <div
        ref={scrollContainerRef}
        data-lenis-prevent="true"
        style={{ scrollSnapType: "x mandatory" }}
        className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {SHOWCASE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="snap-start shrink-0 w-[290px] sm:w-[330px]"
          >
            <HoloTiltCard className="h-full">
              <div className="flex flex-col justify-between h-[360px] p-2">
                {/* Top Badge Info */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-zinc-300 font-bold uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {item.spread}
                  </span>
                </div>

                {/* Stylized Sneaker Silhouette Stage */}
                <div className="my-auto py-4 flex flex-col items-center justify-center relative group">
                  <svg
                    viewBox="0 0 240 120"
                    className="w-4/5 h-auto drop-shadow-xl filter transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Sole */}
                    <path
                      d="M20 95 C60 97 120 98 180 98 C210 98 228 92 232 82 C232 78 220 78 210 78 C175 78 100 80 25 85 Z"
                      fill="#18181b"
                      stroke="#3f3f46"
                      strokeWidth="1.5"
                    />
                    {/* Upper */}
                    <path
                      d="M25 85 C65 82 130 82 210 78 C216 78 222 74 218 68 C195 58 160 55 130 58 C110 59 95 50 75 48 C55 46 35 60 22 74 Z"
                      fill="#27272a"
                      stroke={item.silhouetteColor}
                      strokeWidth="1.5"
                    />
                    {/* Accent Swoosh / Streak */}
                    <path
                      d="M55 70 C90 58 140 52 190 60"
                      stroke="#bef264"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-2">
                    {item.brand} • SIZE {item.size} US
                  </span>
                </div>

                {/* Footer Info & Action */}
                <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mt-1">
                      <span>Retail: ${item.retail}</span>
                      <span className="text-zinc-200 font-bold">Est: ${item.avgResale}</span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onSelectSneaker({
                        brand: item.brand,
                        sneaker_name: item.name,
                        retail_price: item.retail,
                        shoe_size: item.size,
                        days_since_release: item.days,
                      })
                    }
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-[#bef264] text-zinc-300 hover:text-zinc-950 border border-zinc-800 hover:border-[#bef264] text-xs font-mono font-bold tracking-wider transition-all duration-150 cursor-pointer active:scale-98"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>VALUATE SPECIMEN</span>
                  </button>
                </div>
              </div>
            </HoloTiltCard>
          </div>
        ))}
      </div>
    </div>
  );
}
