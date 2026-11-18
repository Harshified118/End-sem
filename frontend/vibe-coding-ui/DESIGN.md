# DropOrCop — DESIGN.md

**Direction: Precision Lab with Cinematic Depth.** A dark, evidence-first tool for a serious ML
project. The verdict is the loudest element; the shoe is the stage. Cinematic polish comes from
easing, material depth and parallax — never from scroll-jacking or competing colours.

## Design tokens

The DOM attribute `data-theme` on `<html>` is the single source of truth: `dark` (default) or
`day`. Every component uses the same semantic utilities; only the token values change.

### Dark (default)

| Token | Value | Role |
|---|---|---|
| canvas | `#09090b` | Page ground, inset fields |
| surface | `#121215` | Elevated cards, cockpit, verdict |
| inset | `#09090b` | Inputs and dark wells |
| hairline | zinc-800 `#27272a` | 1px borders |
| accent | `#bef264` | Action, active, focus only |
| accent-readable / on-accent | `#bef264` / `#09090b` | Accent text/focus / text on accent fill |
| cop / cop-ink | `#10b981` / `#09090b` | Profitable verdict / text on COP fill |
| drop / drop-ink | `#f43f5e` / `#ffffff` | Rejected verdict / text on DROP fill |
| warn | `#f59e0b` | Offline / demo / extrapolated only |
| ink-1 / ink-2 / ink-3 / ink-4 | `#f4f4f5` / `#d4d4d8` / `#a1a1aa` / `#71717a` | Primary / secondary / microcopy / decorative only |
| radius | 12px card, 16px panel | One radius per surface class |

### Day

| Token | Value | Role |
|---|---|---|
| canvas / surface | `#ffffff` / `#ffffff` | Page ground / elevated cards |
| inset / hairline | `#f4f4f5` / `#e4e4e7` | Inputs / 1px borders |
| accent | `#bef264` | Filled actions stay the same lime |
| accent-readable / on-accent | `#3f6212` / `#09090b` | Readable lime text/focus on white / text on fill |
| cop / cop-ink | `#047857` / `#ffffff` | Accessible green verdict / text on fill |
| drop / drop-ink | `#e11d48` / `#ffffff` | Accessible rose verdict / text on fill |
| warn | `#b45309` | Accessible amber for offline / demo / extrapolated |
| ink-1 / ink-2 / ink-3 / ink-4 | `#18181b` / `#3f3f46` / `#52525b` / `#a1a1aa` | Primary / secondary / microcopy / decorative only |

Day uses darker shades of the same semantic hues — no hue substitutions, no filters. One colour
per semantic role. No slate/zinc mixing, no alternate lime or green. `ink-4` is decorative only;
readable text uses `ink-3` or brighter.

**Type scale:** 12 / 14 / 16 / 18 / 22 / 28 / 40 px. Plus Jakarta Sans 600/700/800 for UI and
headings; JetBrains Mono 500/700 only for digits (prices, ROI, days, model metrics). Minimum
readable label 14px; microcopy 12px. Sentence case everywhere except the COP / DROP verdict word.

**Contrast (Dark on canvas, WCAG AA):** ink-1 18.2:1 · ink-2 14.1:1 · ink-3 7.6:1 · accent 15.2:1 ·
cop 7.8:1 · drop 5.4:1 · warn 9.2:1. `ink-4` 4.2:1 → never used for text. In Day, semantic text
uses the darker `-readable` / `-ink` shades so the same roles stay AA on white.

## Elevation

Surface `#121215` over canvas `#09090b`; multi-layer shadow = 1px white inset hairline +
2px/4px contact + 18px/40px ambient. Shadows are pre-baked, never animated. HoloTiltCard uses a
1000px perspective, ±6° pointer tilt, `preserve-3d`, and a glare that follows the pointer.

## Motion rules

- Scroll-driven, never scroll-jacked: no pins, no marketing hold, no progress bar.
- Hero shoe floats slowly, breathes its pre-baked shadow, drifts toward the pointer, auto-spins
  across 36 real WebP frames; drag takes manual control.
- Sections reveal eyebrow → heading → body at ~80ms; watchlist cards at 60ms.
- Parallax and reveals animate **transform and opacity only**. No width, height, margin, colour
  or box-shadow animation. Never block reading; nothing moves faster than 600ms.
- Easing `cubic-bezier(0.22, 1, 0.36, 1)`. One authored rhythm across the whole page.

## Reduced motion

When `prefers-reduced-motion: reduce`: auto-spin, float, parallax, pointer drift and pointer tilt
are off; every transition/animation collapses to `0.01ms` or nothing. Content is visible by
default — motion never gates reading. The 360 rotator still works on explicit drag.

## Copy rules

One disclaimer, once: “Estimates from a model trained on Yeezy & Off-White StockX sales. Not
financial advice.” Use “retail price”, “days since release”, “verdict”, “past checks”, “model
info”. No MSRP, no holding period, no pseudo-code, no developer labels.
