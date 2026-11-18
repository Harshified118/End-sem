"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  Sparkles,
  Cpu,
  Database,
  ShieldCheck,
  Rotate3d,
  Play,
  Pause,
} from "lucide-react";

interface PinnedParallaxHeroProps {
  onExploreClick?: () => void;
}

export function PinnedParallaxHero({ onExploreClick }: PinnedParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroPinnedRef = useRef<HTMLDivElement>(null);
  const shoeVisualRef = useRef<HTMLDivElement>(null);
  const badgeLeftRef = useRef<HTMLDivElement>(null);
  const badgeRightRef = useRef<HTMLDivElement>(null);
  const rotatorRef = useRef<HTMLDivElement>(null);

  // 360-degree interactive rotation states for topmost hero red shoe (ow-chicago)
  const totalFrames = 36;
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startFrame, setStartFrame] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(false);

  // Generate frame path
  const getFrameUrl = useCallback((index: number) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const normalized = ((index % totalFrames) + totalFrames) % totalFrames;
    const padNum = String(normalized + 1).padStart(2, "0");
    return `${basePath}/shoes/360_webp/ow-chicago/frame_${padNum}.webp`;
  }, [totalFrames]);

  // Preload initial keyframes on mount
  useEffect(() => {
    const keyFrames = [0, 4, 8, 12, 16, 20, 24, 28, 32];
    keyFrames.forEach((idx) => {
      const img = new Image();
      img.src = getFrameUrl(idx);
    });
  }, [getFrameUrl]);

  // Preload all 36 frames after slight delay for smooth interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [getFrameUrl, totalFrames]);

  // Auto-spin orbit animation
  useEffect(() => {
    if (!isAutoSpinning) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % totalFrames);
    }, 70);
    return () => clearInterval(interval);
  }, [isAutoSpinning, totalFrames]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartFrame(frameIndex);
    setIsAutoSpinning(false);
  };

  const handleGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const frameDelta = Math.floor(deltaX / 9);
      const newFrame = ((startFrame + frameDelta) % totalFrames + totalFrames) % totalFrames;
      setFrameIndex(newFrame);
    },
    [isDragging, startX, startFrame, totalFrames]
  );

  const handleGlobalMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleGlobalMouseMove, handleGlobalMouseUp]);

  // Touch drag support for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartFrame(frameIndex);
    setIsAutoSpinning(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    const frameDelta = Math.floor(deltaX / 10);
    const newFrame = ((startFrame + frameDelta) % totalFrames + totalFrames) % totalFrames;
    setFrameIndex(newFrame);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Optional hover scrub
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || isAutoSpinning || !rotatorRef.current) return;
    const rect = rotatorRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const targetFrame = Math.floor(ratio * (totalFrames - 1));
    setFrameIndex(targetFrame);
  };

  // GSAP scroll-triggered parallax pinning
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current || !heroPinnedRef.current) return;

    const ctx = gsap.context(() => {
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

      if (shoeVisualRef.current) {
        tl.fromTo(
          shoeVisualRef.current,
          { scale: 0.95, y: 0 },
          { scale: 1.03, y: 5, ease: "none" },
          0
        );
      }

      if (badgeLeftRef.current) {
        tl.fromTo(
          badgeLeftRef.current,
          { x: 0, opacity: 0.8 },
          { x: -50, opacity: 1, ease: "none" },
          0
        );
      }

      if (badgeRightRef.current) {
        tl.fromTo(
          badgeRightRef.current,
          { x: 0, opacity: 0.8 },
          { x: 50, opacity: 1, ease: "none" },
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
        className="w-full min-h-[90vh] flex flex-col items-center justify-between py-10 px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* Top Kicker Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 font-semibold tracking-wide backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#bef264]" />
          <span>AI SNEAKER RESALE ADVISOR</span>
        </div>

        {/* Hero Headline & Purpose: Minimal & 1-Glance Understandable */}
        <div className="text-center max-w-4xl mx-auto space-y-4 pt-3 relative z-30">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase font-sans leading-[1.05]">
            SHOULD YOU COP OR DROP? <br />
            <span className="text-zinc-500 font-extrabold">KNOW YOUR RESALE PROFIT BEFORE YOU BUY.</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 font-sans max-w-2xl mx-auto leading-relaxed">
            Instant AI resale price and profit predictions trained on 94,000+ verified StockX sales.
          </p>

          {/* 1-Glance 3-Step Process Guide — BIGGER & Eye-Catching */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 text-sm sm:text-base font-mono">
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-zinc-900/95 border-2 border-zinc-700 text-zinc-100 shadow-lg backdrop-blur-md">
              <span className="w-7 h-7 rounded-full bg-[#bef264] text-zinc-950 font-black flex items-center justify-center text-sm shadow-md">
                1
              </span>
              <span className="font-bold tracking-tight">Pick a Sneaker</span>
            </div>
            <span className="text-[#bef264] hidden sm:inline font-black text-lg">→</span>
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-zinc-900/95 border-2 border-zinc-700 text-zinc-100 shadow-lg backdrop-blur-md">
              <span className="w-7 h-7 rounded-full bg-[#bef264] text-zinc-950 font-black flex items-center justify-center text-sm shadow-md">
                2
              </span>
              <span className="font-bold tracking-tight">See AI Resale Price & Profit</span>
            </div>
            <span className="text-[#bef264] hidden sm:inline font-black text-lg">→</span>
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-zinc-900/95 border-2 border-zinc-700 text-zinc-100 shadow-lg backdrop-blur-md">
              <span className="w-7 h-7 rounded-full bg-[#bef264] text-zinc-950 font-black flex items-center justify-center text-sm shadow-md">
                3
              </span>
              <span className="font-bold tracking-tight">
                Get Verdict: <strong className="text-[#bef264]">COP</strong> or <strong className="text-rose-400">DROP</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Central Stage: 360° Rotatable Red Sneaker + Telemetry Badges */}
        <div className="relative w-full max-w-4xl mx-auto mt-8 mb-5 flex items-center justify-center">
          {/* Left Telemetry Badge: Clean & Minimal */}
          <div
            ref={badgeLeftRef}
            className="hidden md:flex flex-col gap-1.5 p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md font-mono text-left shadow-2xl absolute left-2 lg:left-4 z-20"
          >
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
              <Cpu className="w-3 h-3 text-[#bef264]" />
              <span>AI MODEL BRAIN</span>
            </div>
            <div className="text-xs font-bold text-zinc-200">Random Forest Regressor</div>
            <div className="text-[11px] text-[#bef264] font-semibold">Trained on 94,355 Sales</div>
          </div>

          {/* Central 360° Rotatable Sneaker Visual Stage */}
          <div
            ref={shoeVisualRef}
            className="w-full max-w-lg relative flex flex-col items-center justify-center p-3 select-none"
          >
            {/* Dynamic Radial Floor Spotlight Glow */}
            <div className="absolute inset-x-8 bottom-4 h-24 bg-radial from-[#bef264]/20 via-zinc-850/10 to-transparent blur-2xl pointer-events-none transition-all duration-700" />

            {/* Dynamic Soft Floor Contact Shadow */}
            <div
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 45%, transparent 75%)",
              }}
              className="absolute bottom-6 w-3/4 h-8 rounded-full blur-md transition-all duration-500 pointer-events-none"
            />

            {/* 360° Interactive Rotator Canvas Area */}
            <div
              ref={rotatorRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative z-10 w-full max-h-76 flex flex-col items-center justify-center transition-all duration-300 ${
                isDragging ? "cursor-grabbing scale-105" : "cursor-grab hover:scale-105"
              }`}
            >
              {/* Top Hint Pill: Drag to Rotate 360° */}
              <div className="mb-2 flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[11px] font-mono font-bold text-zinc-200 backdrop-blur-md shadow-md">
                <Rotate3d className="w-3.5 h-3.5 text-[#bef264] animate-spin" style={{ animationDuration: "6s" }} />
                <span>DRAG TO ROTATE 360°</span>
                <span className="text-zinc-500">|</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAutoSpinning(!isAutoSpinning);
                  }}
                  className="flex items-center gap-1 text-[#bef264] hover:text-white transition-colors cursor-pointer"
                >
                  {isAutoSpinning ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Auto-Spin</span>
                    </>
                  )}
                </button>
              </div>

              {/* 360 Frame Image */}
              <img
                src={getFrameUrl(frameIndex)}
                alt="Off-White x Air Jordan 1 Chicago"
                draggable={false}
                className="w-full max-h-68 object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] pointer-events-none select-none transition-all duration-75"
              />

              {/* Angle Indicator Dots Strip */}
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const activeSeg = Math.floor(frameIndex / 3);
                  return (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-150 ${
                        activeSeg === i ? "w-4 bg-[#bef264]" : "w-1.5 bg-zinc-800"
                      }`}
                    />
                  );
                })}
              </div>
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

          {/* Right Telemetry Badge: Clean & Minimal */}
          <div
            ref={badgeRightRef}
            className="hidden md:flex flex-col gap-1.5 p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md font-mono text-right shadow-2xl absolute right-2 lg:right-4 z-20"
          >
            <div className="flex items-center justify-end gap-2 text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
              <Database className="w-3 h-3 text-[#bef264]" />
              <span>VERDICT ENGINE</span>
            </div>
            <div className="text-xs font-bold text-zinc-200">StockX Pricing Benchmark</div>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>99.02% Accuracy Signal</span>
            </div>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-1 flex flex-col items-center gap-2.5">
          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#bef264] text-zinc-950 font-black text-sm tracking-tight hover:bg-[#a3e635] shadow-lg shadow-[#bef264]/10 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span>LAUNCH VALUATION COCKPIT</span>
            <ArrowDown className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
            SCROLL DOWN TO CALCULATE RESALE PROFIT
          </span>
        </div>
      </div>
    </div>
  );
}
