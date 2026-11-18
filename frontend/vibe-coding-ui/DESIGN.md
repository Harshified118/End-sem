# DropOrCop Design System Specification (DESIGN.md)

## Brand Identity & Aesthetic POV
- **Vibe:** Dark precision streetwear arbitrage tool. Minimal, confident, uncluttered, and effortlessly legible.
- **Inspiration:** Top-tier minimal editorial interfaces (Awwwards, Apple, Linear, StockX Pro).
- **Core Principle:** Remove noise until only essential decision-driving data remains. A user should instantly understand what a feature does and what action to take.

---

## 1. Typography Hierarchy

| Role | Font Family | Weight | Size / Leading | Usage |
|---|---|---|---|---|
| **Display / Hero** | Plus Jakarta Sans (`font-sans`) | 900 / Black | 3rem–5rem / 1.05 | Hero headlines, major landing banners |
| **Section Heading** | Plus Jakarta Sans (`font-sans`) | 800 / ExtraBold | 1.5rem–1.875rem | "Resale Profit Calculator", "Arbitrage Appraisal" |
| **Field / Card Label** | Plus Jakarta Sans (`font-sans`) | 700 / Bold | 0.75rem–0.875rem | Uppercase tracking-wider (`tracking-wider text-xs`) |
| **Body & Subtitles** | Plus Jakarta Sans (`font-sans`) | 500 / Medium | 0.875rem / 1.5 | Explanatory copy, instructions |
| **Data & Financials** | JetBrains Mono (`font-mono`) | 800 / ExtraBold | 1.5rem–3rem | Prices, margins, days, model stats ONLY |

### Strict Typography Rules
- **No Monospace as Costume:** Never use `font-mono` for field labels, section titles, buttons, or pseudo-code comments. Monospace is reserved exclusively for numerical data (currency, metrics, percentages).
- **No Code Punctuation in UI:** Absolute ban on developer/terminal artifacts like `// STOCKX VALUATION RESULT`, `// FACULTY EVALUATION DIRECTIVE`, and `; $120.91...`.
- **No Parenthetical Instruction Tags:** Ban labels like `SNEAKER BRAND (DROPDOWN)` or `SHOE SIZE (US MEN'S)`. Use clean, human labels: `Sneaker Brand`, `Shoe Size`.

---

## 2. Color Palette & Semantics

| Token | Hex / Class | Purpose |
|---|---|---|
| **Canvas Background** | `#09090b` (`bg-[#09090b]`) | Deepest void background |
| **Surface Card** | `#121215` (`bg-[#121215]`) | Main container cards |
| **Input / Field** | `#09090b` (`bg-zinc-950`) | Inset inputs, selects, field controls |
| **Subtle Border** | `border-zinc-800` | Refined 1px dividers and card contours |
| **Brand Accent** | `#bef264` (Volt Lime) | Focal action buttons, active indicators |
| **Verdict COP** | `#10b981` (`emerald-500`) | Buy/profit signals, positive returns |
| **Verdict DROP** | `#f43f5e` (`rose-500`) | Loss/risk signals, depreciation |
| **Text Primary** | `#ffffff` (`text-white`) | Headings, key figures |
| **Text Secondary** | `#d4d4d8` (`text-zinc-300`) | High-legibility body copy |
| **Text Muted** | `#a1a1aa` (`text-zinc-400`) | Secondary labels, units, metadata |

---

## 3. UI/UX Simplification & Decluttering Rules

### Form Layout (`ValuationCockpit`)
1. **Header:**
   - Badge: `VALUATION INPUT PARAMETERS` (subtle uppercase tracking-wider).
   - Title: `Resale Profit Calculator`.
   - Subtitle: `Configure sneaker attributes to predict secondary resale price and COP / DROP verdict.`
2. **Quick Presets:** Keep a clean, compact strip of 6 curated sneakers at the top for 1-click loading.
3. **Fields (Single Source of Truth):**
   - **Sneaker Brand:** Clean `<select>` dropdown. **No redundant duplicate pill buttons underneath**.
   - **Sneaker Model:** Clean `<select>` dropdown synchronized with the selected brand. **No redundant pill buttons underneath**.
   - **Retail Price & Shoe Size:** 2-column clean inputs with clear iconography (`$`, size).
   - **Holding Period (Days):** Combined range slider + numeric input with 5 clean presets (`0d`, `30d`, `90d`, `180d`, `365d`).
4. **Primary CTA:** Full-width high-contrast Volt button: `Calculate Resale Valuation →`.

### Appraisal Stage (`SneakerCard3D`)
1. **No Pseudo-Code Comments:** Clean card header with sneaker model name, retail price, size, and holding days.
2. **Hero Verdict Banner:**
   - Single clean badge: `COP • Profitable Flip` (emerald) or `DROP • High Risk` (rose).
   - Plain English verdict: `Expected resale is $120.91 above the original price.`
3. **Resale Valuation Hero:**
   - Prominent large dollar figure (`$340.91 USD`) in JetBrains Mono.
4. **Financial Impact Grid:**
   - Net Profit: `+$120.91`
   - ROI Margin: `+55.0%`
5. **Clean Metadata Strip:** Retail Price, US Size, and Holding Days in neat, uncluttered badges.
