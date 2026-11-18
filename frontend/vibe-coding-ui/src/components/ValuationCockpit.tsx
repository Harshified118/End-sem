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
  ChevronDown,
} from "lucide-react";
import { PredictPayload } from "@/lib/api";

interface ValuationCockpitProps {
  supportedBrands: string[];
  defaultRetailMap: Record<string, number>;
  onSubmit: (payload: PredictPayload) => Promise<void>;
  isLoading: boolean;
  prefillData?: Partial<PredictPayload> | null;
}

export interface SneakerModelOption {
  name: string;
  retail: number;
  days: number;
  size?: number;
}

export const BRAND_MODELS_CATALOG: Record<string, SneakerModelOption[]> = {
  Yeezy: [
    { name: "Yeezy Boost 350 V2 Zebra", retail: 220, days: 45, size: 10.5 },
    { name: "Yeezy Boost 350 V2 Beluga 2.0", retail: 220, days: 90, size: 10.0 },
    { name: "Yeezy Boost 350 V2 Cream White", retail: 220, days: 60, size: 9.5 },
    { name: "Yeezy Boost 350 V2 Butter", retail: 220, days: 40, size: 10.5 },
    { name: "Yeezy Boost 350 V2 Blue Tint", retail: 220, days: 60, size: 10.0 },
    { name: "Yeezy Boost 350 V2 Static", retail: 220, days: 30, size: 10.5 },
    { name: "Yeezy Boost 350 V2 Semi Frozen Yellow", retail: 220, days: 80, size: 11.0 },
    { name: "Yeezy Boost 350 V2 Sesame", retail: 220, days: 70, size: 10.0 },
    { name: "adidas Yeezy Slide Onyx", retail: 70, days: 15, size: 11.0 },
    { name: "adidas Yeezy Foam Runner Ararat", retail: 75, days: 20, size: 10.0 },
    { name: "adidas Yeezy Boost 700 Wave Runner", retail: 300, days: 120, size: 10.5 },
  ],
  "Off-White": [
    { name: "Off-White x Air Jordan 1 Chicago", retail: 190, days: 120, size: 10.5 },
    { name: "Off-White x Nike Air Presto", retail: 160, days: 180, size: 10.0 },
    { name: "Nike Air Presto Off-White Black", retail: 160, days: 180, size: 10.0 },
    { name: "Nike Air VaporMax Off-White", retail: 250, days: 150, size: 10.5 },
    { name: "Air Jordan 1 Retro High Off-White University Blue", retail: 190, days: 100, size: 10.5 },
    { name: "Nike Blazer Mid Off-White Grim Reaper", retail: 130, days: 90, size: 9.5 },
    { name: "Nike Blazer Mid Off-White All Hallows Eve", retail: 130, days: 90, size: 10.0 },
    { name: "Nike Air Max 90 Off-White Black", retail: 160, days: 140, size: 10.5 },
    { name: "Nike Air Force 1 Low Off-White Volt", retail: 170, days: 110, size: 9.5 },
    { name: "Nike Zoom Fly Off-White Pink", retail: 170, days: 90, size: 10.0 },
  ],
  Jordan: [
    { name: "Air Jordan 1 Retro High Chicago", retail: 180, days: 30, size: 10.5 },
    { name: "Travis Scott x AJ1 Reverse Mocha", retail: 150, days: 90, size: 10.5 },
    { name: "Air Jordan 1 Retro High Bred Banned", retail: 180, days: 60, size: 10.0 },
    { name: "Air Jordan 4 Retro Bred Reimagined", retail: 215, days: 45, size: 10.5 },
    { name: "Air Jordan 4 Retro Military Blue", retail: 215, days: 30, size: 10.0 },
    { name: "Air Jordan 3 Retro White Cement Reimagined", retail: 210, days: 60, size: 10.5 },
    { name: "Air Jordan 11 Retro Concord", retail: 220, days: 365, size: 11.0 },
    { name: "Air Jordan 4 Retro SB Pine Green", retail: 225, days: 120, size: 10.5 },
  ],
  Nike: [
    { name: "Nike Dunk Low Retro Panda", retail: 115, days: 60, size: 9.5 },
    { name: "Nike SB Dunk Low Travis Scott", retail: 150, days: 180, size: 10.5 },
    { name: "Nike SB Dunk Low Chunky Dunky", retail: 100, days: 240, size: 10.0 },
    { name: "Nike Air Force 1 '07 Triple White", retail: 115, days: 10, size: 10.0 },
    { name: "Nike Dunk Low Syracuse Orange", retail: 100, days: 90, size: 9.5 },
    { name: "Nike Air Max 1 Travis Scott Cactus Jack", retail: 160, days: 120, size: 10.5 },
    { name: "Nike SB Dunk Low Born x Raised", retail: 130, days: 150, size: 10.0 },
    { name: "Nike SB Dunk Low Jarritos", retail: 130, days: 180, size: 10.5 },
  ],
  adidas: [
    { name: "adidas Samba OG Cloud White", retail: 100, days: 30, size: 9.5 },
    { name: "adidas Gazelle Indoor Core Black", retail: 120, days: 45, size: 10.0 },
    { name: "adidas Campus 00s Core Black", retail: 110, days: 60, size: 9.5 },
    { name: "adidas Forum Low White Royal", retail: 100, days: 90, size: 10.0 },
    { name: "adidas Ultra Boost 1.0 Triple White", retail: 190, days: 180, size: 10.5 },
    { name: "adidas Stan Smith Cloud White Green", retail: 100, days: 365, size: 10.0 },
    { name: "adidas Superstar Core Black White", retail: 100, days: 180, size: 10.0 },
    { name: "adidas Bad Bunny Campus Chalk White", retail: 160, days: 90, size: 10.5 },
  ],
  "New Balance": [
    { name: "New Balance 990v5 Grey", retail: 185, days: 90, size: 10.5 },
    { name: "New Balance 550 White Grey", retail: 110, days: 45, size: 10.0 },
    { name: "New Balance 2002R Protection Pack Rain Cloud", retail: 150, days: 60, size: 10.5 },
    { name: "New Balance 990v6 Grey", retail: 200, days: 30, size: 10.5 },
    { name: "New Balance 992 Grey", retail: 175, days: 120, size: 10.0 },
    { name: "New Balance 1906R Metallic Silver", retail: 155, days: 40, size: 10.0 },
    { name: "New Balance 550 Aimé Leon Dore Green", retail: 130, days: 180, size: 10.5 },
  ],
  Converse: [
    { name: "Converse Chuck Taylor All-Star 70 High Black", retail: 90, days: 60, size: 10.0 },
    { name: "Converse Chuck 70 Off-White Clear", retail: 130, days: 300, size: 10.5 },
    { name: "Converse Run Star Hike Black", retail: 110, days: 90, size: 9.5 },
  ],
  ASICS: [
    { name: "ASICS GEL-Kayano 14 Metallic Plum", retail: 150, days: 45, size: 10.5 },
    { name: "ASICS GT-2160 White Pure Silver", retail: 120, days: 30, size: 10.0 },
    { name: "ASICS GEL-NYC Cream Steel Grey", retail: 130, days: 60, size: 10.5 },
  ],
  Puma: [
    { name: "Puma Suede Classic XXI Black", retail: 75, days: 60, size: 10.0 },
    { name: "Puma Palermo OG Blue White", retail: 90, days: 45, size: 9.5 },
    { name: "Puma MB.01 LaMelo Ball Red Blast", retail: 125, days: 120, size: 10.5 },
  ],
  Reebok: [
    { name: "Reebok Club C 85 Vintage Chalk", retail: 90, days: 45, size: 10.0 },
    { name: "Reebok Question Mid Iverson", retail: 160, days: 90, size: 10.5 },
  ],
  Salomon: [
    { name: "Salomon XT-6 Black Phantom", retail: 200, days: 60, size: 10.5 },
    { name: "Salomon ACS Pro Advanced Silver", retail: 220, days: 90, size: 10.0 },
  ],
  Crocs: [
    { name: "Crocs Pollex Clog Salehe Bembury Menemsha", retail: 85, days: 120, size: 10.0 },
    { name: "Crocs Classic Clog Black", retail: 50, days: 30, size: 10.0 },
  ],
};

export function getModelsForBrand(targetBrand: string): SneakerModelOption[] {
  const normTarget = targetBrand.trim().toLowerCase();
  const matchedKey = Object.keys(BRAND_MODELS_CATALOG).find(
    (k) => k.toLowerCase() === normTarget
  );
  if (matchedKey && BRAND_MODELS_CATALOG[matchedKey]) {
    return BRAND_MODELS_CATALOG[matchedKey];
  }
  return [
    { name: `${targetBrand} Classic Low`, retail: 120, days: 30, size: 10.0 },
    { name: `${targetBrand} Retro High`, retail: 150, days: 60, size: 10.5 },
    { name: `${targetBrand} Runner Pro`, retail: 160, days: 90, size: 10.0 },
  ];
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
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);
  const [customModelName, setCustomModelName] = useState<string>("");
  const [retailPrice, setRetailPrice] = useState<number>(220);
  const [shoeSize, setShoeSize] = useState<number>(10.5);
  const [daysSinceRelease, setDaysSinceRelease] = useState<number>(45);
  const [threshold, setThreshold] = useState<number>(0.15);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const brandsList = supportedBrands.length > 0 ? supportedBrands : FALLBACK_BRANDS;
  const availableModels = getModelsForBrand(brand);

  // Sync prefillData when user clicks from Front Shoe Scroll Rail or History
  useEffect(() => {
    if (prefillData) {
      if (prefillData.brand) setBrand(prefillData.brand);
      if (prefillData.sneaker_name) {
        const targetBrand = prefillData.brand || brand;
        const models = getModelsForBrand(targetBrand);
        const match = models.find(
          (m) => m.name.toLowerCase() === prefillData.sneaker_name?.toLowerCase()
        );
        if (match) {
          setSneakerName(match.name);
          setIsCustomModel(false);
          setCustomModelName("");
        } else {
          setSneakerName(prefillData.sneaker_name);
          setIsCustomModel(true);
          setCustomModelName(prefillData.sneaker_name);
        }
      }
      if (prefillData.retail_price) setRetailPrice(prefillData.retail_price);
      if (prefillData.shoe_size) setShoeSize(prefillData.shoe_size);
      if (prefillData.days_since_release !== undefined) setDaysSinceRelease(prefillData.days_since_release);
      if (prefillData.threshold !== undefined) setThreshold(prefillData.threshold);
    }
  }, [prefillData, brand]);

  const handleBrandSelect = (selectedBrand: string) => {
    setBrand(selectedBrand);
    const models = getModelsForBrand(selectedBrand);
    if (models.length > 0) {
      const first = models[0];
      setSneakerName(first.name);
      setRetailPrice(first.retail);
      setDaysSinceRelease(first.days);
      if (first.size) setShoeSize(first.size);
      setIsCustomModel(false);
      setCustomModelName("");
    } else if (defaultRetailMap[selectedBrand]) {
      setRetailPrice(defaultRetailMap[selectedBrand]);
    }
  };

  const handleModelChange = (selectedModelName: string) => {
    if (selectedModelName === "__CUSTOM__") {
      setIsCustomModel(true);
      setCustomModelName(sneakerName);
      return;
    }
    setIsCustomModel(false);
    setSneakerName(selectedModelName);
    const models = getModelsForBrand(brand);
    const match = models.find((m) => m.name === selectedModelName);
    if (match) {
      setRetailPrice(match.retail);
      setDaysSinceRelease(match.days);
      if (match.size) setShoeSize(match.size);
    }
  };

  const handleCustomModelChange = (text: string) => {
    setCustomModelName(text);
    setSneakerName(text);
  };

  const handleSelectPreset = (preset: (typeof PRESET_SNEAKERS)[0]) => {
    setBrand(preset.brand);
    setSneakerName(preset.name);
    setRetailPrice(preset.retail);
    setShoeSize(preset.size);
    setDaysSinceRelease(preset.days);
    setIsCustomModel(false);
    setCustomModelName("");
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

    const finalSneakerName = isCustomModel ? customModelName.trim() : sneakerName.trim();

    try {
      await onSubmit({
        brand,
        retail_price: Number(retailPrice),
        shoe_size: Number(shoeSize),
        days_since_release: Number(daysSinceRelease),
        sneaker_name: finalSneakerName || undefined,
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
          <div className="text-xs font-bold font-sans uppercase tracking-wider text-[#bef264] flex items-center gap-1.5 mb-1">
            <Sliders className="w-3.5 h-3.5 text-[#bef264]" />
            <span>VALUATION INPUT PARAMETERS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-sans tracking-tight">
            Resale Profit Calculator
          </h2>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Input sneaker specs to predict secondary market resale value and get an instant COP / DROP verdict.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setBrand("Yeezy");
            setSneakerName("Yeezy Boost 350 V2 Zebra");
            setIsCustomModel(false);
            setCustomModelName("");
            setRetailPrice(220);
            setShoeSize(10.5);
            setDaysSinceRelease(45);
            setThreshold(0.15);
            setErrorMsg(null);
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Quick Preset Badges */}
      <div className="py-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#bef264]" />
            Quick Presets
          </span>
          <span className="text-xs text-zinc-400">Click to auto-fill</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_SNEAKERS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-[#bef264]/15 hover:border-[#bef264]/60 border border-zinc-800 text-zinc-300 hover:text-white font-medium transition-all cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* SNEAKER BRAND */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-300">
              Sneaker Brand
            </label>
            <span className="text-xs text-zinc-500 font-sans">Verified StockX catalog</span>
          </div>

          <div className="relative">
            <select
              value={brand}
              onChange={(e) => handleBrandSelect(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-[#bef264] rounded-2xl px-5 py-3.5 text-base text-white font-semibold font-sans focus:outline-none focus:ring-2 focus:ring-[#bef264]/20 transition-all cursor-pointer appearance-none pr-12 shadow-sm"
            >
              {brandsList.map((b) => (
                <option key={b} value={b} className="bg-zinc-900 text-white font-sans py-2">
                  {b}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 text-zinc-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Sneaker Model Name */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-300">
              Sneaker Model
            </label>
            <span className="text-xs font-medium text-zinc-400 font-sans">
              {availableModels.length} {brand} models
            </span>
          </div>

          <div className="relative">
            <select
              value={isCustomModel ? "__CUSTOM__" : sneakerName}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-[#bef264] rounded-2xl px-5 py-3.5 text-base text-white font-semibold font-sans focus:outline-none focus:ring-2 focus:ring-[#bef264]/20 transition-all cursor-pointer appearance-none pr-12 shadow-sm"
            >
              <optgroup label={`Select ${brand} Model`} className="bg-zinc-900 text-white font-sans">
                {availableModels.map((m) => (
                  <option key={m.name} value={m.name} className="bg-zinc-900 text-white font-sans py-2">
                    {m.name} (MSRP: ${m.retail})
                  </option>
                ))}
              </optgroup>
              <option value="__CUSTOM__" className="bg-zinc-800 text-[#bef264] font-sans font-bold py-2">
                ✏️ Custom / Type Another Model...
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 text-zinc-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>

          {/* If custom model option is active, show text input */}
          {isCustomModel && (
            <div className="mt-3">
              <input
                type="text"
                value={customModelName}
                onChange={(e) => handleCustomModelChange(e.target.value)}
                placeholder={`Type custom ${brand} model name...`}
                className="w-full bg-zinc-950 border border-[#bef264]/60 rounded-2xl px-5 py-3 text-base text-white font-medium placeholder-zinc-500 focus:outline-none focus:border-[#bef264] focus:ring-2 focus:ring-[#bef264]/20 transition-colors"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* ORIGINAL SHOP PRICE & SHOE SIZE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Original Shop Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-300">
                Original Retail Price ($ USD)
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#bef264] font-bold text-base">
                <DollarSign className="w-5 h-5" />
              </div>
              <input
                type="number"
                step="1"
                min="1"
                max="5000"
                value={retailPrice}
                onChange={(e) => setRetailPrice(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-[#bef264] rounded-2xl pl-11 pr-5 py-3 text-base text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#bef264]/20 transition-colors shadow-sm"
              />
            </div>
          </div>

          {/* Shoe Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-300">
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
                className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-[#bef264] rounded-2xl pl-11 pr-10 py-3 text-base text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#bef264]/20 transition-colors cursor-pointer appearance-none shadow-sm"
              >
                {SHOE_SIZES.map((size) => (
                  <option key={size} value={size} className="bg-zinc-900 text-white font-mono font-bold">
                    US Men's Size {size.toFixed(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* NUMBER OF DAYS SINCE RELEASE */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-300">
              Holding Period / Days Since Release
            </label>
            <span className="text-sm text-[#bef264] font-bold font-mono">
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
              className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-[#bef264]"
            />
            <input
              type="number"
              min="0"
              max="1000"
              value={daysSinceRelease}
              onChange={(e) => setDaysSinceRelease(Math.max(0, Number(e.target.value)))}
              className="w-24 bg-zinc-950 border border-zinc-800 focus:border-[#bef264] rounded-xl px-3 py-2 text-center text-sm font-mono font-bold text-white focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-2.5">
            {DAY_PRESETS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setDaysSinceRelease(p.days)}
                className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer font-semibold ${
                  daysSinceRelease === p.days
                    ? "bg-[#bef264] text-zinc-950 border-[#bef264] font-bold"
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
          className="w-full py-4 px-8 rounded-2xl bg-[#bef264] hover:bg-[#a3e635] text-zinc-950 font-black text-base tracking-tight shadow-xl shadow-[#bef264]/20 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
        >
          {isLoading ? (
            <div className="flex items-center gap-3 font-sans">
              <div className="w-5 h-5 border-3 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
              <span>Calculating Model Inference...</span>
            </div>
          ) : (
            <>
              <span className="font-extrabold font-sans uppercase tracking-tight">Calculate Resale Valuation & Verdict</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
