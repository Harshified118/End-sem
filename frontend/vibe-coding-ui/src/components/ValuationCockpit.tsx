"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PredictPayload } from "@/lib/api";

interface ValuationCockpitProps {
  supportedBrands: string[];
  defaultRetailMap: Record<string, number>;
  onSubmit: (payload: PredictPayload) => Promise<void>;
  isLoading: boolean;
  prefillData?: Partial<PredictPayload> | null;
}

const PRESET_SNEAKERS = [
  { name: "Yeezy Boost 350 V2 Zebra", brand: "Yeezy", retail: 220, size: 10.5, days: 45 },
  { name: "Air Jordan 1 Retro High Chicago", brand: "Jordan", retail: 180, size: 10.5, days: 30 },
  { name: "Off-White x Nike Air Presto", brand: "Off-White", retail: 160, size: 10.0, days: 120 },
  { name: "Nike Dunk Low Retro Panda", brand: "Nike", retail: 115, size: 9.5, days: 60 },
  { name: "New Balance 990v5 Grey", brand: "New Balance", retail: 185, size: 10.5, days: 90 },
  { name: "adidas Yeezy Slide Onyx", brand: "Yeezy", retail: 70, size: 11.0, days: 15 },
];

const SHOE_SIZES = [
  4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 14.0, 15.0,
];

const DAY_PRESETS = [
  { label: "Drop Day (0d)", days: 0 },
  { label: "1 Month (30d)", days: 30 },
  { label: "3 Months (90d)", days: 90 },
  { label: "6 Months (180d)", days: 180 },
  { label: "1 Year (365d)", days: 365 },
];

const FALLBACK_BRANDS = ["Yeezy", "Off-White", "Jordan", "Nike", "adidas", "New Balance"];

export function ValuationCockpit({
  supportedBrands,
  defaultRetailMap,
  onSubmit,
  isLoading,
  prefillData,
}: ValuationCockpitProps) {
  const [brand, setBrand] = useState<string>("Yeezy");
  const [sneakerName, setSneakerName] = useState<string>("Yeezy Boost 350 V2 Zebra");
  const [retailPrice, setRetailPrice] = useState<number>(220);
  const [shoeSize, setShoeSize] = useState<number>(10.5);
  const [daysSinceRelease, setDaysSinceRelease] = useState<number>(45);
  const [threshold, setThreshold] = useState<number>(0.15);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const brandsList = supportedBrands.length > 0 ? supportedBrands : FALLBACK_BRANDS;

  // Sync prefillData when user clicks from Front Shoe Scroll Rail or History
  useEffect(() => {
    if (prefillData) {
      if (prefillData.brand) setBrand(prefillData.brand);
      if (prefillData.sneaker_name) setSneakerName(prefillData.sneaker_name);
      if (prefillData.retail_price) setRetailPrice(prefillData.retail_price);
      if (prefillData.shoe_size) setShoeSize(prefillData.shoe_size);
      if (prefillData.days_since_release !== undefined) setDaysSinceRelease(prefillData.days_since_release);
      if (prefillData.threshold !== undefined) setThreshold(prefillData.threshold);
    }
  }, [prefillData]);

  const handleBrandSelect = (selectedBrand: string) => {
    setBrand(selectedBrand);
    if (defaultRetailMap[selectedBrand]) {
      setRetailPrice(defaultRetailMap[selectedBrand]);
    }
  };

  const handleSelectPreset = (preset: (typeof PRESET_SNEAKERS)[0]) => {
    setBrand(preset.brand);
    setSneakerName(preset.name);
    setRetailPrice(preset.retail);
    setShoeSize(preset.size);
    setDaysSinceRelease(preset.days);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    // Sensible Numbers Validation (Mentor Requirement)
    if (!brand || brand.trim() === "") {
      setErrorMsg("Please select a valid sneaker brand from the dropdown.");
      return;
    }
    if (isNaN(retailPrice) || retailPrice <= 0) {
      setErrorMsg("Original shop price must be a sensible positive amount greater than $0.");
      return;
    }
    if (retailPrice > 5000) {
      setErrorMsg("Original shop price exceeds standard retail MSRP ($5,000 limit). Please enter a realistic shop price.");
      return;
    }
    if (isNaN(shoeSize) || shoeSize < 3.5 || shoeSize > 18) {
      setErrorMsg("Please select a standard US men's shoe size between 4.0 and 15.0.");
      return;
    }
    if (isNaN(daysSinceRelease) || daysSinceRelease < 0) {
      setErrorMsg("Number of days since release cannot be negative.");
      return;
    }

    try {
      await onSubmit({
        brand,
        retail_price: Number(retailPrice),
        shoe_size: Number(shoeSize),
        days_since_release: Number(daysSinceRelease),
        sneaker_name: sneakerName.trim() || undefined,
        threshold: Number(threshold),
      });
    } catch {
      setErrorMsg("Valuation calculation failed. Please check inputs or try again.");
    }
  };

  return (
    <div className="w-full bg-[#121215] border-2 border-zinc-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-md relative select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-[#bef264]" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight uppercase">
              Valuation Input Parameters
            </h2>
          </div>
          <p className="text-sm sm:text-base text-zinc-300 font-medium mt-1">
            Enter sneaker attributes to calculate estimated resale price and COP / DROP recommendation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setBrand("Yeezy");
            setSneakerName("Yeezy Boost 350 V2 Zebra");
            setRetailPrice(220);
            setShoeSize(10.5);
            setDaysSinceRelease(45);
            setThreshold(0.15);
            setErrorMsg(null);
          }}
          className="inline-flex items-center gap-2 text-sm font-mono font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 w-fit"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Quick Preset Badges */}
      <div className="py-5 border-b border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#bef264]" />
            Quick Test Presets (One-Click)
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {PRESET_SNEAKERS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-[#bef264]/10 hover:border-[#bef264]/50 border border-zinc-800 text-zinc-200 hover:text-white font-medium transition-all cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-7">
        {/* 1. SNEAKER BRAND DROPDOWN (Mentor Directive: Use a brand dropdown) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm sm:text-base font-mono uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#bef264] text-zinc-950 font-black flex items-center justify-center text-xs">
                1
              </span>
              Sneaker Brand (Dropdown)
            </label>
            <span className="text-xs font-mono text-zinc-400 font-medium">Mentor Requirement</span>
          </div>

          <div className="relative">
            <select
              value={brand}
              onChange={(e) => handleBrandSelect(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-zinc-700 hover:border-zinc-500 rounded-2xl px-5 py-4 text-base sm:text-lg text-white font-mono font-bold focus:outline-none focus:border-[#bef264] focus:ring-2 focus:ring-[#bef264]/30 transition-all cursor-pointer shadow-inner"
            >
              {brandsList.map((b) => (
                <option key={b} value={b} className="bg-zinc-900 text-white font-mono font-bold py-2">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Brand Shortcut Pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {brandsList.map((b) => {
              const isSelected = brand.toLowerCase() === b.toLowerCase();
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleBrandSelect(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-[#bef264] text-zinc-950 border-[#bef264] shadow-sm"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sneaker Model Name Input (Optional Keyword Filter) */}
        <div>
          <label className="block text-sm sm:text-base font-mono uppercase tracking-wider text-zinc-200 mb-2 font-bold">
            Sneaker Model Name <span className="text-zinc-500 font-normal font-sans text-xs">(e.g. Zebra, Chicago, Travis Scott)</span>
          </label>
          <input
            type="text"
            value={sneakerName}
            onChange={(e) => setSneakerName(e.target.value)}
            placeholder="e.g. Yeezy Boost 350 V2 Zebra"
            className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-5 py-3.5 text-base sm:text-lg text-white font-medium placeholder-zinc-500 focus:outline-none focus:border-[#bef264] focus:ring-2 focus:ring-[#bef264]/30 transition-colors"
          />
        </div>

        {/* 2 & 3. ORIGINAL SHOP PRICE & SHOE SIZE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* 2. Original Shop Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm sm:text-base font-mono uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#bef264] text-zinc-950 font-black flex items-center justify-center text-xs">
                  2
                </span>
                Original Shop Price ($ USD)
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#bef264] font-black text-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <input
                type="number"
                step="1"
                min="1"
                max="5000"
                value={retailPrice}
                onChange={(e) => setRetailPrice(Number(e.target.value))}
                className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl pl-11 pr-5 py-3.5 text-base sm:text-lg text-white font-mono font-bold focus:outline-none focus:border-[#bef264] focus:ring-2 focus:ring-[#bef264]/30 transition-colors"
              />
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 font-sans">
              Enter sensible dollar price (e.g. $160 – $220).
            </p>
          </div>

          {/* 3. Shoe Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm sm:text-base font-mono uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#bef264] text-zinc-950 font-black flex items-center justify-center text-xs">
                  3
                </span>
                Shoe Size (US Men's)
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <Layers className="w-5 h-5" />
              </div>
              <select
                value={shoeSize}
                onChange={(e) => setShoeSize(Number(e.target.value))}
                className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl pl-11 pr-5 py-3.5 text-base sm:text-lg text-white font-mono font-bold focus:outline-none focus:border-[#bef264] focus:ring-2 focus:ring-[#bef264]/30 transition-colors cursor-pointer appearance-none"
              >
                {SHOE_SIZES.map((size) => (
                  <option key={size} value={size} className="bg-zinc-900 text-white font-mono font-bold">
                    US Men's Size {size.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 font-sans">
              Half-sizes 4.0 to 15.0 per StockX standard.
            </p>
          </div>
        </div>

        {/* 4. NUMBER OF DAYS SINCE RELEASE */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm sm:text-base font-mono uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#bef264] text-zinc-950 font-black flex items-center justify-center text-xs">
                4
              </span>
              Number of Days Since Release
            </label>
            <span className="text-base sm:text-lg text-[#bef264] font-black font-mono">
              {daysSinceRelease} Days
            </span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="365"
              step="1"
              value={daysSinceRelease}
              onChange={(e) => setDaysSinceRelease(Number(e.target.value))}
              className="w-full h-3 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-[#bef264]"
            />
            <input
              type="number"
              min="0"
              max="1000"
              value={daysSinceRelease}
              onChange={(e) => setDaysSinceRelease(Math.max(0, Number(e.target.value)))}
              className="w-24 bg-zinc-950 border-2 border-zinc-800 rounded-xl px-3 py-2 text-center text-base font-mono font-bold text-white focus:outline-none focus:border-[#bef264]"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {DAY_PRESETS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setDaysSinceRelease(p.days)}
                className={`text-xs sm:text-sm font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                  daysSinceRelease === p.days
                    ? "bg-[#bef264] text-zinc-950 border-[#bef264]"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-sm font-medium flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-8 rounded-2xl bg-[#bef264] hover:bg-[#a3e635] text-zinc-950 font-black text-base sm:text-lg tracking-tight shadow-xl shadow-[#bef264]/20 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
              <span>Calculating Model Inference...</span>
            </div>
          ) : (
            <>
              <span>CALCULATE RESALE VALUATION (COP / DROP)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
