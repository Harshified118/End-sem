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

          {/* Central 3D Sneaker Visual Stage */}
          <div
            ref={shoeVisualRef}
            className="w-full max-w-lg aspect-[16/10] relative rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 via-zinc-950/90 to-zinc-950 p-6 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md overflow-hidden group"
          >
            {/* Subtle background glow circle */}
            <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent pointer-events-none" />

            {/* Stylized Vector Sneaker Graphic with Specular Holographic Sheen */}
            <svg
              viewBox="0 0 360 200"
              className="w-4/5 h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter group-hover:scale-105 transition-transform duration-500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sole */}
              <path
                d="M30 150 C70 152 140 155 240 155 C290 155 330 145 335 130 C335 125 320 125 305 125 C260 125 150 128 35 136 Z"
                fill="#18181b"
                stroke="#3f3f46"
                strokeWidth="2"
              />
              <path
                d="M35 136 C100 132 200 132 305 125 C315 125 325 118 320 110 C290 95 240 92 195 95 C165 97 140 85 110 82 C80 80 50 100 32 120 Z"
                fill="#27272a"
                stroke="#52525b"
                strokeWidth="1.5"
              />
              {/* Collar & Tongue */}
              <path
                d="M110 82 C125 55 150 45 175 42 C185 41 190 50 190 62 C190 75 195 95 195 95 Z"
                fill="#09090b"
                stroke="#bef264"
                strokeWidth="1.5"
              />
              {/* Off-White Style Accent Swoosh / Zip Line */}
              <path
                d="M80 115 C130 95 200 85 270 98"
                stroke="#bef264"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Monospace Spec Stamp */}
              <text x="75" y="142" fill="#71717a" fontSize="7" fontFamily="monospace" fontWeight="bold">
                STOCKX SPEC: AJ1-HIGH-OFFWHITE // 2018-Q2
              </text>
            </svg>

            {/* Specular Status HUD Overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-ping" />
                <span>SPECIMEN // 001</span>
              </span>
              <span className="text-zinc-500">RESALE SPREAD: +142.8%</span>
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
