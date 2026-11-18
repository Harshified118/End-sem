"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Sparkles, TrendingUp, Cpu, Database, ShieldCheck } from "lucide-react";

interface PinnedParallaxHeroProps {
  onExploreClick?: () => void;
}

export function PinnedParallaxHero({ onExploreClick }: PinnedParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroPinnedRef = useRef<HTMLDivElement>(null);
  const shoeVisualRef = useRef<HTMLDivElement>(null);
  const badgeLeftRef = useRef<HTMLDivElement>(null);
  const badgeRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current || !heroPinnedRef.current) return;

    const ctx = gsap.context(() => {
      // Pin hero and scrub product visuals
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroPinnedRef.current,
          start: "top 64px",
          end: "+=600",
          pin: true,
          pinSpacing: true,
          scrub: 1,
        },
      });

      // Scale central sneaker visual
      if (shoeVisualRef.current) {
        tl.fromTo(
          shoeVisualRef.current,
          { scale: 0.9, y: 0 },
          { scale: 1.06, y: -25, ease: "none" },
          0
        );
      }

      // Lateral divergence for telemetry badges
      if (badgeLeftRef.current) {
        tl.fromTo(
          badgeLeftRef.current,
          { x: 0, opacity: 0.8 },
          { x: -60, opacity: 1, ease: "none" },
          0
        );
      }

      if (badgeRightRef.current) {
        tl.fromTo(
          badgeRightRef.current,
          { x: 0, opacity: 0.8 },
          { x: 60, opacity: 1, ease: "none" },
          0
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <div
        ref={heroPinnedRef}
        className="w-full min-h-[90vh] flex flex-col items-center justify-between py-12 px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* Top Kicker Pill */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300 font-semibold tracking-wide backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#bef264]" />
          <span>SECONDARY MARKET ARBITRAGE • MACHINE INTELLIGENCE</span>
        </div>

        {/* Hero Title & Subtext */}
        <div className="text-center max-w-4xl mx-auto space-y-4 pt-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase font-sans leading-[1.05]">
            PREDICT RESALE VALUE. <br />
            <span className="text-zinc-500 font-extrabold">ACCELERATE ALPHA.</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-sans max-w-2xl mx-auto leading-relaxed">
            Secondary market valuation engine trained on 94,355 verified StockX transactions.
            Sub-millisecond inference, real-time margin thresholds, and instant{" "}
            <span className="text-[#bef264] font-semibold">COP</span> or{" "}
            <span className="text-rose-400 font-semibold">DROP</span> recommendation telemetry.
          </p>
        </div>

        {/* Central Stage: Scaled Sneaker Visual + Scrubbed Lateral Badges */}
        <div className="relative w-full max-w-4xl mx-auto my-6 flex items-center justify-center">
          {/* Left Telemetry Badge */}
          <div
            ref={badgeLeftRef}
            className="hidden md:flex flex-col gap-2 p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md font-mono text-left shadow-2xl absolute left-4 z-20"
          >
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              <Cpu className="w-3 h-3 text-[#bef264]" />
              <span>ALGORITHM CORE</span>
            </div>
            <div className="text-xs font-bold text-zinc-200">Random Forest Regressor</div>
            <div className="text-[11px] text-[#bef264] font-semibold">R² = 0.6525 • MAE $88.69</div>
          </div>

          {/* Central 3D Floating Sneaker Visual Stage */}
          <div
            ref={shoeVisualRef}
            className="w-full max-w-lg relative flex flex-col items-center justify-center p-4 group select-none"
          >
            {/* Dynamic Radial Floor Spotlight Glow */}
            <div className="absolute inset-x-8 bottom-4 h-24 bg-radial from-[#bef264]/20 via-zinc-850/10 to-transparent blur-2xl pointer-events-none group-hover:from-[#bef264]/35 transition-all duration-700" />

            {/* Dynamic Soft Floor Contact Shadow */}
            <div
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 45%, transparent 75%)",
              }}
              className="absolute bottom-6 w-3/4 h-8 rounded-full blur-md group-hover:scale-110 group-hover:opacity-75 transition-all duration-500 pointer-events-none"
            />

            {/* Floating Popped-Out Sneaker */}
            <div className="relative z-10 transition-all duration-500 ease-out group-hover:scale-112 group-hover:-translate-y-4">
              <img
                src="/shoes/ow-chicago_hero.webp"
                alt="Off-White x Air Jordan 1 Chicago"
                className="w-full max-h-72 object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_35px_45px_rgba(0,0,0,0.95)] transition-all duration-500"
              />
            </div>

            {/* Specular Status HUD Overlay */}
            <div className="mt-4 flex items-center justify-between w-full max-w-md text-xs font-mono font-bold text-zinc-300">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#bef264] animate-ping" />
                <span>OFF-WHITE x AJ1 CHICAGO // THE TEN</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#bef264] text-zinc-950 font-black shadow-md shadow-[#bef264]/20">
                SPREAD: +142.8%
              </span>
            </div>
          </div>

          {/* Right Telemetry Badge */}
          <div
            ref={badgeRightRef}
            className="hidden md:flex flex-col gap-2 p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md font-mono text-right shadow-2xl absolute right-4 z-20"
          >
            <div className="flex items-center justify-end gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              <Database className="w-3 h-3 text-[#bef264]" />
              <span>TRAINING SAMPLE</span>
            </div>
            <div className="text-xs font-bold text-zinc-200">94,355 Transactions</div>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>99.02% Verdict Accuracy</span>
            </div>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#bef264] text-zinc-950 font-black text-sm tracking-tight hover:bg-[#a3e635] shadow-lg shadow-[#bef264]/10 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span>LAUNCH VALUATION COCKPIT</span>
            <ArrowDown className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
            SCROLL TO EXPLORE MOTION & SPECIMENS
          </span>
        </div>
      </div>
    </div>
  );
}
