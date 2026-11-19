/**
 * Single source of truth for the reference sneaker watchlist.
 *
 * These are illustrative market snapshots used by the hero, watchlist and
 * header search. They are NOT model predictions. Keeping one catalogue
 * prevents the same shoe from showing different resale values across the page.
 */

export interface CatalogSneaker {
  id: string;
  name: string;
  brand: string;
  /** Original retail price in USD. */
  retail: number;
  /** Illustrative secondary-market resale snapshot in USD. */
  resale: number;
  size: number;
  days: number;
  tag: string;
  rarity: string;
  hype: string;
  /** Optional sprite folder override for 360 WebP sequence */
  spriteId?: string;
}

export const REFERENCE_SNEAKERS: CatalogSneaker[] = [
  {
    id: "ow-chicago",
    name: "Off-White x Air Jordan 1 Chicago",
    brand: "Off-White",
    retail: 190,
    resale: 461,
    size: 10.5,
    days: 120,
    tag: "GRAIL // THE TEN",
    rarity: "Very rare",
    hype: "High — sold out in minutes",
  },
  {
    id: "ts-reverse-mocha",
    name: "Travis Scott x AJ1 Reverse Mocha",
    brand: "Jordan",
    retail: 150,
    resale: 1150,
    size: 10.0,
    days: 90,
    tag: "CACTUS JACK",
    rarity: "Grail tier",
    hype: "Ultra rare — instant sellout",
  },
  {
    id: "yzy-zebra",
    name: "Yeezy Boost 350 V2 Zebra",
    brand: "Yeezy",
    retail: 220,
    resale: 341,
    size: 10.5,
    days: 45,
    tag: "HIGH LIQUIDITY",
    rarity: "High liquidity",
    hype: "Iconic — high demand",
  },
  {
    id: "dunk-panda",
    name: "Nike Dunk Low Retro Panda",
    brand: "Nike",
    retail: 115,
    resale: 180,
    size: 9.5,
    days: 30,
    tag: "HIGH VOLUME",
    rarity: "Everyday staple",
    hype: "Mass appeal — constant restocks",
    spriteId: "dunk-panda",
  },
  {
    id: "nb-990",
    name: "New Balance 990v5 Grey",
    brand: "New Balance",
    retail: 185,
    resale: 215,
    size: 10.5,
    days: 60,
    tag: "HERITAGE RUN",
    rarity: "Steady demand",
    hype: "Heritage runner — durable resale",
  },
  {
    id: "ow-presto",
    name: "Off-White x Nike Air Presto",
    brand: "Off-White",
    retail: 160,
    resale: 880,
    size: 10.0,
    days: 180,
    tag: "GRAIL // VIRGIL",
    rarity: "Very rare",
    hype: "Cult classic — limited supply",
  },
  {
    id: "nike-travis-dunk",
    name: "Nike SB Dunk Low Travis Scott",
    brand: "Nike",
    retail: 150,
    resale: 1650,
    size: 10.5,
    days: 180,
    tag: "CACTUS JACK // SB",
    rarity: "Grail tier",
    hype: "Ultra rare — instant sellout",
    spriteId: "dunk-panda",
  },
  {
    id: "nike-chunky-dunky",
    name: "Nike SB Dunk Low Chunky Dunky",
    brand: "Nike",
    retail: 100,
    resale: 1350,
    size: 10.0,
    days: 240,
    tag: "BEN & JERRY'S",
    rarity: "Collector grail",
    hype: "Historic pop collaboration",
    spriteId: "dunk-panda",
  },
  {
    id: "nike-af1-white",
    name: "Nike Air Force 1 '07 Triple White",
    brand: "Nike",
    retail: 115,
    resale: 140,
    size: 10.0,
    days: 10,
    tag: "ICONIC CLASSIC",
    rarity: "Everyday staple",
    hype: "Global streetwear classic",
    spriteId: "dunk-panda",
  },
];

export function sampleProfit(sneaker: CatalogSneaker): number {
  return sneaker.resale - sneaker.retail;
}

export function spreadPct(sneaker: CatalogSneaker): number {
  return ((sneaker.resale - sneaker.retail) / sneaker.retail) * 100;
}

export function formatSpread(sneaker: CatalogSneaker, digits = 1): string {
  const value = spreadPct(sneaker);
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}
