"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Rotate3d } from "lucide-react";
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
  onTap: (side: "left" | "right") => void;
  reducedMotion: boolean;
}

export function Shoe360({ shoe, onTap, reducedMotion }: Shoe360Props) {
  const [frame, setFrame] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [spinning, setSpinning] = useState(!reducedMotion);
  const [ready, setReady] = useState(false);
  const drag = useRef({ x: 0, frame: 0, moved: false });
  const driftRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const preloaded = useRef<Set<string>>(new Set());

  const spriteId = shoe.spriteId || shoe.id;
  const getFrame = useCallback(
    (index: number) => frameUrl(spriteId, sanitizeFrame(shoe, index)),
    [spriteId, shoe]
  );

  useEffect(() => {
    setReady(false);
    preloaded.current = new Set();
    let cancelled = false;

    const warm = async () => {
      const urls = Array.from({ length: TOTAL_FRAMES }, (_, index) => getFrame(index));
      await Promise.all(
        urls.map(
          (src) =>
            new Promise<void>((resolve) => {
              const image = new window.Image();
              image.decoding = "async";
              image.onload = () => {
                preloaded.current.add(src);
                resolve();
              };
              image.onerror = () => resolve();
              image.src = src;
            })
        )
      );
      if (!cancelled) setReady(true);
    };

    void warm();
    return () => {
      cancelled = true;
    };
  }, [getFrame]);

  useEffect(() => {
    if (!spinning || reducedMotion) return;
    const id = window.setInterval(() => setFrame((prev) => (prev + 1) % TOTAL_FRAMES), 80);
    return () => window.clearInterval(id);
  }, [spinning, reducedMotion]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointer events have no active pointer to capture.
    }
    drag.current = { x: event.clientX, frame, moved: false };
    setDragging(true);
    setSpinning(false);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const deltaX = event.clientX - drag.current.x;
    if (Math.abs(deltaX) > 6) drag.current.moved = true;
    if (dragging) {
      const next = drag.current.frame + Math.round(deltaX / 8);
      setFrame(((next % TOTAL_FRAMES) + TOTAL_FRAMES) % TOTAL_FRAMES);
    }
    if (!reducedMotion && driftRef.current && stageRef.current) {
      const bounds = stageRef.current.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      driftRef.current.style.transform = `translate3d(${(x * 12).toFixed(2)}px, ${(y * 6).toFixed(2)}px, 0)`;
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

  return (
    <div ref={stageRef} className="relative w-full" onPointerLeave={onPointerLeave}>
      <div
        role="button"
        tabIndex={0}
        data-testid="hero-shoe-interactive"
        aria-label={`${shoe.name}. Tap one side for details, drag to rotate, or use the left and right arrow keys.`}
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
        className={`relative flex w-full items-center justify-center rounded-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-readable ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div className="relative flex h-[280px] w-full items-center justify-center sm:h-[360px] lg:h-[420px]">
          <div className="hero-shadow pointer-events-none absolute bottom-4 h-8 w-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.35)_55%,transparent_78%)]" />
          <div ref={driftRef} className="transition-transform duration-300 ease-out will-change-transform">
            <div className={`hero-float ${ready ? "opacity-100" : "opacity-80"} transition-opacity duration-300`}>
              <Image
                src={getFrame(frame)}
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
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-12 text-ink-3">
        <Rotate3d className="size-3.5 text-accent-readable" aria-hidden="true" />
        <span>Drag to rotate · Tap for details</span>
        {reducedMotion ? null : (
          <button
            type="button"
            onClick={() => setSpinning((prev) => !prev)}
            className="text-accent-readable transition-colors hover:text-ink-1"
          >
            {spinning ? "Pause spin" : "360° spin"}
          </button>
        )}
      </div>
    </div>
  );
}
