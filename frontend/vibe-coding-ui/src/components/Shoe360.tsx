"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Rotate3d } from "lucide-react";
import type { CatalogSneaker } from "@/lib/sneakers";

const TOTAL_FRAMES = 36;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
  const drag = useRef({ x: 0, frame: 0, moved: false });
  const driftRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const getFrame = useCallback((index: number) => frameUrl(shoe.id, index), [shoe.id]);

  useEffect(() => {
    if (!spinning || reducedMotion) return;
    const id = window.setInterval(() => setFrame((prev) => (prev + 1) % TOTAL_FRAMES), 90);
    return () => window.clearInterval(id);
  }, [spinning, reducedMotion]);

  useEffect(() => {
    [0, 6, 12, 18, 24, 30].forEach((index) => {
      const image = new window.Image();
      image.src = getFrame(index);
    });
  }, [getFrame]);

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
      const next = drag.current.frame + Math.round(deltaX / 9);
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
        <div className="relative flex h-[220px] w-full items-center justify-center sm:h-[280px] lg:h-[320px]">
          <div className="hero-shadow pointer-events-none absolute bottom-3 h-7 w-2/3 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.35)_55%,transparent_78%)]" />
          <div ref={driftRef} className="transition-transform duration-300 ease-out will-change-transform">
            <div className="hero-float">
              <Image
                src={getFrame(frame)}
                alt={shoe.name}
                draggable={false}
                width={720}
                height={360}
                loading="eager"
                data-testid="hero-frame"
                className="pointer-events-none h-auto max-h-[300px] w-auto max-w-full select-none object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.75)] sm:max-h-[340px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-center gap-1.5 text-12 text-ink-3">
        <Rotate3d className="size-3.5 text-accent-readable" aria-hidden="true" />
        <span>Tap the shoe for details</span>
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
