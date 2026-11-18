"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
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
  { name: "Off-White x Nike Air Presto", brand: "Off-White", retail: 160, size: 10.0, days: 120 },
  { name: "Air Jordan 1 Retro High Chicago", brand: "Jordan", retail: 180, size: 10.5, days: 30 },
  { name: "Nike Dunk Low Retro Panda", brand: "Nike", retail: 115, size: 9.5, days: 60 },
  { name: "adidas Yeezy Slide Onyx", brand: "Yeezy", retail: 70, size: 11.0, days: 15 },
];

const SHOE_SIZES = [
  4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 14.0, 15.0,
];

const DAY_PRESETS = [
  { label: "Drop Day (0d)", days: 0 },
  { label: "1 Month (30d)", days: 30 },
  { label: "3 Mos (90d)", days: 90 },
  { label: "6 Mos (180d)", days: 180 },
  { label: "1 Year (365d)", days: 365 },
];

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

  // Sync prefillData when user clicks re-run from history ledger
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

    if (retailPrice <= 0) {
      setErrorMsg("Retail price must be greater than $0.");
      return;
    }
    if (shoeSize <= 0) {
      setErrorMsg("Please select a valid US shoe size.");
      return;
    }
    if (daysSinceRelease < 0) {
      setErrorMsg("Days since release cannot be negative.");
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
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to calculate valuation.");
    }
  };

  return (
    <div className="w-full bg-[#10121a]/90 border border-white/[0.08] rounded-2xl p-6 lg:p-8 backdrop-blur-sm relative overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#bef264]" />
            <h2 className="text-base font-semibold text-white font-sans tracking-tight">
              Arbitrage Valuation Parameters
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Input sneaker release attributes to run inference via Random Forest regressor
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
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer px-2.5 py-1 rounded-md hover:bg-white/[0.04]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Quick Preset Badges */}
      <div className="py-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#bef264]" />
            Quick Presets
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_SNEAKERS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-[#bef264]/10 hover:border-[#bef264]/40 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer font-sans"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Brand Selector Chips */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-2 font-semibold">
            Sneaker Brand
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(supportedBrands.length > 0 ? supportedBrands : ["Yeezy", "Off-White", "Jordan", "Nike", "adidas", "New Balance"]).map(
              (b) => {
                const isSelected = brand.toLowerCase() === b.toLowerCase();
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleBrandSelect(b)}
                    className={`py-2 px-3 rounded-xl text-xs font-sans font-medium transition-all text-center border cursor-pointer ${
                      isSelected
                        ? "bg-[#bef264] text-zinc-950 border-[#bef264] shadow-md shadow-[#bef264]/20 ring-2 ring-[#bef264]/30 font-bold"
                        : "bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {b}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Sneaker Model Input */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-2 font-semibold">
            Sneaker Model Name <span className="text-zinc-500 font-normal">(Derives hype keywords)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={sneakerName}
              onChange={(e) => setSneakerName(e.target.value)}
              placeholder="e.g. Yeezy Boost 350 V2 Carbon"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors font-sans"
            />
          </div>
        </div>

        {/* Retail Price and Shoe Size Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Retail Price */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-2 font-semibold">
              Retail Price ($ USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="1"
                min="10"
                max="2000"
                value={retailPrice}
                onChange={(e) => setRetailPrice(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors font-mono"
              />
            </div>
          </div>

          {/* Shoe Size */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-2 font-semibold">
              Shoe Size (US Men's)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Layers className="w-4 h-4" />
              </div>
              <select
                value={shoeSize}
                onChange={(e) => setShoeSize(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors font-mono appearance-none cursor-pointer"
              >
                {SHOE_SIZES.map((size) => (
                  <option key={size} value={size} className="bg-zinc-900 text-white">
                    US {size.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Days Since Release Slider & Quick Presets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#bef264]" />
              Elapsed Holding Period:{" "}
              <span className="text-[#bef264] font-bold font-mono">{daysSinceRelease} Days</span>
            </label>
          </div>
          <input
            type="range"
            min="0"
            max="365"
            step="1"
            value={daysSinceRelease}
            onChange={(e) => setDaysSinceRelease(Number(e.target.value))}
            className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-[#bef264]"
          />
          <div className="flex flex-wrap gap-2 mt-2.5">
            {DAY_PRESETS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setDaysSinceRelease(p.days)}
                className={`text-[11px] font-mono px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  daysSinceRelease === p.days
                    ? "bg-[#bef264]/20 border-[#bef264]/60 text-[#bef264] font-bold"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Arbitrage Profit Margin Threshold Slider */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Target Hurdle Rate (Threshold):{" "}
              <span className="text-emerald-400 font-bold font-mono">
                {(threshold * 100).toFixed(0)}% ROI
              </span>
            </label>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            COP badge requires predicted resale profit margin $\ge$ {(threshold * 100).toFixed(0)}%.
          </p>
          <input
            type="range"
            min="0.05"
            max="0.50"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-[#090a0f] rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>5% Low Risk</span>
            <span>15% Standard (Default)</span>
            <span>50% High Arbitrage</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-sans">
            {errorMsg}
          </div>
        )}

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-[#bef264] hover:bg-[#a3e635] text-zinc-950 font-black text-sm tracking-tight shadow-lg shadow-[#bef264]/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
              <span>Calculating Random Forest Valuation...</span>
            </div>
          ) : (
            <>
              <span>Calculate Resale Valuation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
