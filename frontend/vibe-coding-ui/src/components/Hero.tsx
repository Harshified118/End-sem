"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import { REFERENCE_SNEAKERS, formatSpread, sampleProfit } from "@/lib/sneakers";
import { Shoe360 } from "./Shoe360";
import { Reveal } from "./motion/Reveal";

interface HeroProps {
  onExploreClick: () => void;
  onSelectSneaker: (index: number) => void;
}

export function Hero({ onExploreClick, onSelectSneaker }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [branch, setBranch] = useState<"left" | "right" | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const shoe = REFERENCE_SNEAKERS[index];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stageRef.current && !stageRef.current.contains(event.target as Node)) setBranch(null);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBranch(null);
    };
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current || !visualRef.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        visualRef.current,
        { y: 28, opacity: 0.75 },
        {
          y: -28,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    }, containerRef);
    return () => context.revert();
  }, [reducedMotion]);

  const onTap = (side: "left" | "right") => setBranch((prev) => (prev === side ? null : side));
  const select = (next: number) => {
    setIndex(next);
    setBranch(null);
    onSelectSneaker(next);
  };

  const leftItems: [string, string][] = [
    ["Retail price", `$${shoe.retail}`],
    ["Sample resale", `$${shoe.resale}`],
    ["Sample profit", `+$${sampleProfit(shoe).toFixed(0)}`],
  ];
  const rightItems: [string, string][] = [
    ["Brand", shoe.brand],
    ["Size", `US ${shoe.size.toFixed(1)}`],
    ["Days since release", `${shoe.days} days`],
  ];

  const renderItems = (items: [string, string][]) =>
    items.map(([label, value], itemIndex) => (
      <div
        key={label}
        style={{ animationDelay: `${itemIndex * 60}ms` }}
        className="branch-item material-card pointer-events-auto w-full max-w-[170px] px-3 py-2 sm:max-w-[190px]"
      >
        <p className="text-12 text-ink-3">{label}</p>
        <p className="mt-0.5 font-mono text-14 font-bold tabular text-ink-1">{value}</p>
      </div>
    ));

  return (
    <section
      id="top"
      ref={containerRef}
      aria-labelledby="hero-heading"
      className="relative w-full overflow-hidden px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        <Reveal className="max-w-xl">
          <h1 id="hero-heading" data-reveal-item className="text-28 font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-1 sm:text-40">
            Know the resale price before you buy.
          </h1>
          <p data-reveal-item className="mt-4 max-w-md text-16 leading-relaxed text-ink-3">
            DropOrCop predicts a sneaker&apos;s resale value and gives you a COP or DROP verdict.
          </p>
          <div data-reveal-item className="mt-7">
            <button
              type="button"
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 rounded-card bg-accent px-5 py-3 text-14 font-extrabold text-on-accent transition-transform duration-200 hover:scale-[1.02]"
            >
              Check profit
              <ArrowDown className="size-4" aria-hidden="true" />
            </button>
          </div>
        </Reveal>

        <div ref={visualRef} className="relative min-w-0">
          <div ref={stageRef} className="relative">
            <Shoe360
              key={`${shoe.id}-${reducedMotion}`}
              shoe={shoe}
              onTap={onTap}
              reducedMotion={reducedMotion}
            />

            {branch === "left" && (
              <div
                data-testid="hero-branch-left"
                className="pointer-events-none absolute inset-y-2 left-0 z-20 flex w-[42%] flex-col items-start justify-center gap-2"
              >
                {renderItems(leftItems)}
              </div>
            )}
            {branch === "right" && (
              <div
                data-testid="hero-branch-right"
                className="pointer-events-none absolute inset-y-2 right-0 z-20 flex w-[42%] flex-col items-end justify-center gap-2"
              >
                {renderItems(rightItems)}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2" role="group" aria-label="Sneaker gallery">
            {REFERENCE_SNEAKERS.map((item, dotIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.name}`}
                aria-pressed={index === dotIndex}
                onClick={() => select(dotIndex)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === dotIndex ? "w-6 bg-accent" : "w-1.5 bg-hairline hover:bg-ink-4"
                }`}
              />
            ))}
          </div>
          <p className="mt-4 text-center text-12 text-ink-3 sm:text-14">
            {shoe.name} <span className="font-mono tabular text-accent-readable">{formatSpread(shoe)}</span>
          </p>
          <p className="mt-1 text-center text-12 text-ink-3">
            Sample figures are illustrative, not model predictions.
          </p>
        </div>
      </div>
    </section>
  );
}
