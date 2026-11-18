"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, Zap, Sparkles } from "lucide-react";
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
  imageUrl: string;
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
    imageUrl: "/shoes/jordan-chicago.jpg",
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
    imageUrl: "/shoes/yeezy-zebra.jpg",
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
    imageUrl: "/shoes/travis-scott.jpg",
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
    imageUrl: "/shoes/dunk-panda.jpg",
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
    imageUrl: "/shoes/nb-990.jpg",
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
    imageUrl: "/shoes/offwhite-presto.jpg",
  },
];

interface FrontShoeScrollRailProps {
  onSelectSneaker: (payload: Partial<PredictPayload>) => void;
}

export function FrontShoeScrollRail({ onSelectSneaker }: FrontShoeScrollRailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 380;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full space-y-6 relative py-4 select-none">
      {/* Section Header with Glide Navigation Arrows & Larger Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#bef264] animate-ping" />
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-[#bef264] font-black">
              FEATURED SNEAKERS • SCROLLABLE FRONT SHOWCASE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans mt-1">
            Secondary Market Arbitrage Watchlist
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 mt-1">
            Swipe or use arrows to browse authentic market specimens. Click any shoe to load its attributes into the valuation engine.
          </p>
        </div>

        {/* Directional Glide Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleScroll("left")}
            aria-label="Scroll Rail Left"
            className="p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border-2 border-zinc-800 text-zinc-200 hover:text-white transition-all cursor-pointer backdrop-blur-md active:scale-95 shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            aria-label="Scroll Rail Right"
            className="p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border-2 border-zinc-800 text-zinc-200 hover:text-white transition-all cursor-pointer backdrop-blur-md active:scale-95 shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Smooth Snap Scroll Track */}
      <div
        ref={scrollContainerRef}
        data-lenis-prevent="true"
        style={{ scrollSnapType: "x mandatory" }}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {SHOWCASE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="snap-start shrink-0 w-[310px] sm:w-[360px]"
          >
            <HoloTiltCard className="h-full">
              <div className="flex flex-col justify-between h-[450px] p-2">
                {/* Top Badge Info */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-zinc-200 font-bold uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-mono font-black text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                    <ArrowUpRight className="w-4 h-4" />
                    {item.spread}
                  </span>
                </div>

                {/* REAL SNEAKER PHOTOGRAPHY STAGE */}
                <div className="my-auto py-3 flex flex-col items-center justify-center relative group">
                  <div className="w-full h-44 rounded-2xl overflow-hidden relative border border-zinc-800/80 bg-zinc-950/60 shadow-lg group-hover:border-[#bef264]/40 transition-all duration-300">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono text-zinc-300 font-bold">
                      <span className="px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-700/80">
                        {item.brand}
                      </span>
                      <span className="text-[#bef264]">SIZE {item.size} US</span>
                    </div>
                  </div>
                </div>

                {/* Footer Info & Action */}
                <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm font-mono text-zinc-300 mt-1 font-semibold">
                      <span>Retail MSRP: <strong className="text-zinc-100">${item.retail}</strong></span>
                      <span className="text-[#bef264] font-black text-base">Est: ${item.avgResale}</span>
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
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-zinc-900 hover:bg-[#bef264] text-zinc-200 hover:text-zinc-950 border-2 border-zinc-700 hover:border-[#bef264] text-sm font-mono font-black tracking-wider transition-all duration-150 cursor-pointer active:scale-98 shadow-md"
                  >
                    <Zap className="w-4 h-4" />
                    <span>VALUATE THIS SHOE (AUTO-FILL)</span>
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
