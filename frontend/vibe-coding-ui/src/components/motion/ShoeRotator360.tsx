"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Rotate3d, Sparkles, Maximize2, Zap, X, Eye } from "lucide-react";

interface ShoeRotator360Props {
  shoeId: string;
  name: string;
  brand: string;
  retail: number;
  avgResale: number;
  spread: string;
  totalFrames?: number;
  className?: string;
  onValuate?: () => void;
}

export function ShoeRotator360({
  shoeId,
  name,
  brand,
  retail,
  avgResale,
  spread,
  totalFrames = 36,
  className = "",
  onValuate,
}: ShoeRotator360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startFrame, setStartFrame] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalFrameIndex, setModalFrameIndex] = useState<number>(0);
  const [modalIsAutoSpin, setModalIsAutoSpin] = useState<boolean>(true);

  // Generate image paths
  const getFrameUrl = useCallback(
    (index: number) => {
      const normalized = ((index % totalFrames) + totalFrames) % totalFrames;
      const padNum = String(normalized + 1).padStart(2, "0");
      return `/shoes/360_webp/${shoeId}/frame_${padNum}.webp`;
    },
    [shoeId, totalFrames]
  );

  // Preload first 12 key frames on mount for buttery smooth initial rotation
  useEffect(() => {
    const preloadList = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33];
    preloadList.forEach((idx) => {
      const img = new Image();
      img.src = getFrameUrl(idx);
    });
  }, [getFrameUrl]);

  // Preload remaining frames when hovered
  useEffect(() => {
    if (isHovered) {
      for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
      }
    }
  }, [isHovered, totalFrames, getFrameUrl]);

  // Auto-spin orbit animation if triggered
  useEffect(() => {
    if (!isSpinning) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % totalFrames);
    }, 60);
    return () => clearInterval(interval);
  }, [isSpinning, totalFrames]);

  // Modal Auto-Spin
  useEffect(() => {
    if (!isModalOpen || !modalIsAutoSpin) return;
    const interval = setInterval(() => {
      setModalFrameIndex((prev) => (prev + 1) % totalFrames);
    }, 70);
    return () => clearInterval(interval);
  }, [isModalOpen, modalIsAutoSpin, totalFrames]);

  // Mouse move scrubbing across card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDragging || isSpinning) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const targetFrame = Math.floor(ratio * (totalFrames - 1));
    setFrameIndex(targetFrame);
  };

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartFrame(frameIndex);
    setIsSpinning(false);
  };

  const handleGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const frameDelta = Math.floor(deltaX / 8);
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

  return (
    <>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsSpinning(false);
          // Gently return to 3/4 angle
          setFrameIndex(0);
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full select-none cursor-ew-resize group ${className}`}
      >
        {/* Floating Interactive 360 Tag */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono font-bold text-zinc-300 backdrop-blur-md transition-all duration-300 group-hover:border-[#bef264]/60 group-hover:text-white">
          <Rotate3d className={`w-3.5 h-3.5 ${isHovered ? "text-[#bef264] animate-spin" : "text-zinc-400"}`} />
          <span>360° ROTATE</span>
        </div>

        {/* Pop-Out Expand Modal Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setModalFrameIndex(frameIndex);
            setIsModalOpen(true);
          }}
          title="Open 3D Popout Inspection"
          className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#bef264] hover:bg-zinc-900 transition-all cursor-pointer backdrop-blur-md"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* 3D FLOATING SNEAKER STAGE */}
        <div className="relative w-full h-56 flex flex-col items-center justify-center overflow-visible py-2">
          {/* Ambient Radial Floor Spotlight */}
          <div
            className={`absolute bottom-3 w-3/4 h-8 rounded-full bg-radial from-zinc-700/20 via-zinc-900/10 to-transparent blur-md transition-all duration-500 pointer-events-none ${
              isHovered ? "scale-125 opacity-80" : "scale-100 opacity-40"
            }`}
          />

          {/* Dynamic Photorealistic Contact Shadow */}
          <div
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, transparent 75%)",
            }}
            className={`absolute bottom-5 w-4/5 h-6 rounded-full blur-sm transition-all duration-300 pointer-events-none ${
              isHovered
                ? "scale-110 translate-y-1 opacity-70 blur-md"
                : "scale-95 opacity-90"
            }`}
          />

          {/* POPPING OUT SNEAKER IMAGE */}
          <div
            className={`relative z-10 transition-all duration-300 ease-out will-change-transform ${
              isHovered
                ? "scale-115 -translate-y-3.5 drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)] filter brightness-105"
                : "scale-100 translate-y-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            }`}
          >
            <img
              src={getFrameUrl(frameIndex)}
              alt={`${name} 360 degree frame ${frameIndex + 1}`}
              className="w-full h-48 object-contain pointer-events-none transition-transform duration-75"
              draggable={false}
              loading="eager"
            />
          </div>

          {/* Interaction Instruction Overlay on Hover */}
          <div
            className={`absolute bottom-1 z-20 px-3 py-0.5 rounded-full bg-zinc-950/90 border border-[#bef264]/40 text-[10px] font-mono font-bold text-[#bef264] transition-all duration-300 pointer-events-none backdrop-blur-md flex items-center gap-1.5 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#bef264]" />
            <span>DRAG OR HOVER TO SPIN 360°</span>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN 3D SNEAKER HOLOGRAM INSPECTION MODAL */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-[#121215] border-2 border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#bef264]/10 border border-[#bef264]/40 text-xs font-mono font-black text-[#bef264] uppercase tracking-wider">
                  {brand} SPECIMEN
                </span>
                <span className="text-xs font-mono text-zinc-400 font-bold">
                  360° Studio Inspection
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal 360 Stage */}
            <div className="relative w-full h-80 sm:h-96 flex flex-col items-center justify-center py-6 select-none">
              {/* Dynamic Pedestal Light */}
              <div className="absolute inset-x-12 bottom-6 h-12 bg-radial from-[#bef264]/15 via-zinc-800/20 to-transparent blur-xl pointer-events-none" />

              {/* Floor Shadow */}
              <div
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 80%)",
                }}
                className="absolute bottom-8 w-3/4 h-8 rounded-full blur-md pointer-events-none"
              />

              {/* Large Popped-Out Sneaker */}
              <div className="relative z-10 transition-transform duration-75">
                <img
                  src={getFrameUrl(modalFrameIndex)}
                  alt={`${name} 3D Full Inspection`}
                  className="max-h-72 sm:max-h-80 w-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)]"
                  draggable={false}
                />
              </div>
            </div>

            {/* 360 Degree Rotation Slider & Controls */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300">
                <span className="flex items-center gap-2">
                  <Rotate3d className="w-4 h-4 text-[#bef264]" />
                  ROTATION ANGLE: {Math.round((modalFrameIndex / totalFrames) * 360)}°
                </span>
                <button
                  type="button"
                  onClick={() => setModalIsAutoSpin(!modalIsAutoSpin)}
                  className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                    modalIsAutoSpin
                      ? "bg-[#bef264] text-zinc-950 border-[#bef264]"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  {modalIsAutoSpin ? "Auto-Spin: ON" : "Auto-Spin: OFF"}
                </button>
              </div>

              {/* Angle Slider */}
              <input
                type="range"
                min="0"
                max={totalFrames - 1}
                value={modalFrameIndex}
                onChange={(e) => {
                  setModalIsAutoSpin(false);
                  setModalFrameIndex(Number(e.target.value));
                }}
                className="w-full h-2.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-[#bef264]"
              />

              {/* Shoe Info & Quick Valuate Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <h3 className="text-xl font-black text-white font-sans">{name}</h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 mt-1">
                    <span>Retail: <strong className="text-white">${retail}</strong></span>
                    <span>StockX Est: <strong className="text-[#bef264]">${avgResale}</strong></span>
                    <span className="text-emerald-400 font-bold">{spread} Margin</span>
                  </div>
                </div>

                {onValuate && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      onValuate();
                    }}
                    className="py-3 px-6 rounded-xl bg-[#bef264] hover:bg-[#a3e635] text-zinc-950 font-black font-mono text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#bef264]/20 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    <span>LOAD INTO VALUATION COCKPIT</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
