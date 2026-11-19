"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import type { CatalogSneaker } from "@/lib/sneakers";

const TOTAL_FRAMES = 36;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function isSoleFrame(shoe: CatalogSneaker, frameIndex: number): boolean {
  if (shoe.brand === "Nike" || shoe.id.includes("dunk") || shoe.id.includes("nike")) {
    const norm = ((frameIndex % TOTAL_FRAMES) + TOTAL_FRAMES) % TOTAL_FRAMES;
    return (norm >= 8 && norm <= 11) || (norm >= 26 && norm <= 29);
  }
  return false;
}

export function sanitizeFrame(shoe: CatalogSneaker, frameIndex: number): number {
  const norm = ((frameIndex % TOTAL_FRAMES) + TOTAL_FRAMES) % TOTAL_FRAMES;
  if (isSoleFrame(shoe, norm)) {
    return norm >= 8 && norm <= 11 ? 7 : 25;
  }
  return norm;
}

export function frameUrl(shoeId: string, index: number): string {
  const normalized = ((index % TOTAL_FRAMES) + TOTAL_FRAMES) % TOTAL_FRAMES;
  const pad = String(normalized + 1).padStart(2, "0");
  return `${BASE}/shoes/360_webp/${shoeId}/frame_${pad}.webp`;
}

interface Shoe360Props {
  shoe: CatalogSneaker;
  direction?: number;
  onTap: (side: "left" | "right") => void;
  reducedMotion: boolean;
}

export function Shoe360({ shoe, direction = 1, onTap, reducedMotion }: Shoe360Props) {
  const driftRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  const heroImageSrc = `${BASE}/shoes/${shoe.spriteId || shoe.id}_hero.webp`;

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointer events have no active pointer to capture.
    }
    drag.current = { x: event.clientX, moved: false };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const deltaX = event.clientX - drag.current.x;
    if (Math.abs(deltaX) > 6) drag.current.moved = true;
    if (!reducedMotion && driftRef.current && stageRef.current) {
      const bounds = stageRef.current.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      driftRef.current.style.transform = `translate3d(${(x * 14).toFixed(2)}px, ${(y * 8).toFixed(2)}px, 0)`;
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!drag.current.moved && stageRef.current) {
      const bounds = stageRef.current.getBoundingClientRect();
      onTap(event.clientX - bounds.left < bounds.width / 2 ? "left" : "right");
    }
  };

  const onPointerLeave = () => {
    if (driftRef.current) driftRef.current.style.transform = "translate3d(0,0,0)";
  };

  const variants: Variants = {
    enter: (dir: number) => ({
      x: reducedMotion ? 0 : dir > 0 ? 90 : -90,
      opacity: 0,
      scale: reducedMotion ? 1 : 0.92,
      rotate: reducedMotion ? 0 : dir > 0 ? 3 : -3,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 26 },
        opacity: { duration: 0.32, ease: "easeOut" },
        scale: { type: "spring", stiffness: 260, damping: 22 },
        rotate: { type: "spring", stiffness: 240, damping: 20 },
      },
    },
    exit: (dir: number) => ({
      x: reducedMotion ? 0 : dir > 0 ? -90 : 90,
      opacity: 0,
      scale: reducedMotion ? 1 : 0.92,
      rotate: reducedMotion ? 0 : dir > 0 ? -3 : 3,
      transition: {
        duration: 0.24,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div ref={stageRef} className="relative w-full overflow-hidden" onPointerLeave={onPointerLeave}>
      <div
        role="button"
        tabIndex={0}
        data-testid="hero-shoe-interactive"
        aria-label={`${shoe.name}. Tap one side for details, or use the left and right arrow keys to switch sneakers.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            onTap("left");
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            onTap("right");
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onTap("left");
          }
        }}
        style={{ touchAction: "pan-y" }}
        className="relative flex w-full cursor-pointer items-center justify-center rounded-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-readable"
      >
        <div className="relative flex h-[280px] w-full items-center justify-center sm:h-[360px] lg:h-[420px]">
          <div className="hero-shadow pointer-events-none absolute bottom-4 h-8 w-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.35)_55%,transparent_78%)]" />

          <div ref={driftRef} className="relative flex size-full items-center justify-center transition-transform duration-300 ease-out will-change-transform">
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={shoe.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative flex items-center justify-center"
              >
                <div className="hero-float">
                  <Image
                    src={heroImageSrc}
                    alt={shoe.name}
                    draggable={false}
                    width={1600}
                    height={900}
                    priority
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 55vw, 640px"
                    data-testid="hero-frame"
                    className="pointer-events-none h-auto max-h-[260px] w-auto max-w-[min(100%,640px)] select-none object-contain drop-shadow-[0_22px_36px_rgba(0,0,0,0.8)] sm:max-h-[340px] lg:max-h-[400px]"
                    style={{ imageRendering: "auto" }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-12 text-ink-3">
        <Sparkles className="size-3.5 text-accent-readable" aria-hidden="true" />
        <span>Tap shoe for details · Arrow keys to switch</span>
        {reducedMotion ? null : (
          <span className="text-11 text-ink-4">· Animated preview</span>
        )}
      </div>
    </div>
  );
}
