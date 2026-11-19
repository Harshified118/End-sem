"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  REFERENCE_SNEAKERS,
  formatSpread,
  type CatalogSneaker,
} from "@/lib/sneakers";
import { HoloTiltCard } from "./motion/HoloTiltCard";
import { Reveal } from "./motion/Reveal";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface WatchlistProps {
  onSelectSneaker: (sneaker: CatalogSneaker) => void;
}

export function Watchlist({ onSelectSneaker }: WatchlistProps) {
  const items = REFERENCE_SNEAKERS.slice(0, 6);

  return (
    <section id="wishlist-section" aria-labelledby="watchlist-heading" className="w-full scroll-mt-20">
      <Reveal stagger={0.06}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p data-reveal-item className="text-12 font-semibold uppercase tracking-[0.16em] text-accent-readable">
              Wishlist
            </p>
            <h2 data-reveal-item id="watchlist-heading" className="mt-1 text-22 font-extrabold tracking-tight text-ink-1 sm:text-28">
              Popular Sneaker Wishlist
            </h2>
          </div>
          <p data-reveal-item className="text-12 text-ink-3">
            Curated popular pairs. Pick any pair to instantly calculate its resale profit or loss.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((sneaker) => (
            <div key={sneaker.id} data-reveal-item>
              <HoloTiltCard>
                <button
                  type="button"
                  onClick={() => onSelectSneaker(sneaker)}
                  aria-label={`Check profit for ${sneaker.name}`}
                  className="group flex w-full flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-readable"
                >
                  <div className="relative mb-3 flex h-44 items-center justify-center overflow-hidden rounded-card bg-inset">
                    <Image
                      src={`${BASE}/shoes/${sneaker.spriteId || sneaker.id}_hero.webp`}
                      alt={sneaker.name}
                      width={800}
                      height={500}
                      loading="lazy"
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
                      className="h-full w-full object-contain p-3 drop-shadow-[0_12px_20px_rgba(0,0,0,0.45)]"
                    />
                    <span className="absolute right-2 top-2 rounded-card border border-hairline bg-canvas/90 px-2.5 py-1 font-mono text-12 font-bold tabular text-accent-readable shadow-sm">
                      {formatSpread(sneaker, 0)} Profit
                    </span>
                  </div>
                  <p className="text-12 text-ink-3">{sneaker.brand}</p>
                  <p className="mt-0.5 line-clamp-2 text-14 font-bold leading-snug text-ink-1">
                    {sneaker.name}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
                    <span className="font-mono text-12 tabular text-ink-3">
                      Retail <span className="font-bold text-ink-2">${sneaker.retail}</span>
                    </span>
                    <span className="flex items-center gap-1 text-12 font-semibold text-accent-readable">
                      Check profit
                      <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:[transform:translate(2px,-2px)]" aria-hidden="true" />
                    </span>
                  </div>
                </button>
              </HoloTiltCard>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
