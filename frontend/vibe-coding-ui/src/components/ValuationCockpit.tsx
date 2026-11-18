"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import type { PredictPayload } from "@/lib/api";

interface ValuationCockpitProps {
  supportedBrands: string[];
  defaultRetailMap: Record<string, number>;
  trainedBrands?: string[];
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
    { name: "Nike Air Max 1 Travis Scott Cactus Jack", retail: 160, days: 180, size: 10.5 },
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

const SHOE_SIZES = [
  4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5,
  12.0, 12.5, 13.0, 14.0, 15.0,
];

const DAY_PRESETS = [
  { label: "Drop day", days: 0 },
  { label: "1 month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "1 year", days: 365 },
];

const FALLBACK_BRANDS = ["Yeezy", "Off-White", "Jordan", "Nike", "adidas", "New Balance"];
const FALLBACK_TRAINED_BRANDS = ["Yeezy", "Off-White"];
const MAX_RETAIL_PRICE = 5000;
const MAX_DAYS_SINCE_RELEASE = 36500;

const THRESHOLD_OPTIONS = [
  { value: 0, label: "0%", hint: "Any profit" },
  { value: 0.15, label: "15%", hint: "Default" },
  { value: 0.3, label: "30%", hint: "Cautious" },
];

export function ValuationCockpit({
  supportedBrands,
  defaultRetailMap,
  trainedBrands,
  onSubmit,
  isLoading,
  prefillData,
}: ValuationCockpitProps) {
  const [brand, setBrand] = useState("Yeezy");
  const [sneakerName, setSneakerName] = useState("Yeezy Boost 350 V2 Zebra");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState("");
  const [retailPrice, setRetailPrice] = useState(220);
  const [shoeSize, setShoeSize] = useState(10.5);
  const [daysSinceRelease, setDaysSinceRelease] = useState(45);
  const [threshold, setThreshold] = useState(0.15);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const brandsList = supportedBrands.length > 0 ? supportedBrands : FALLBACK_BRANDS;
  const trainedList =
    trainedBrands && trainedBrands.length > 0 ? trainedBrands : FALLBACK_TRAINED_BRANDS;
  const trainedBrandSet = new Set(trainedList.map((b) => b.toLowerCase()));
  const isExtrapolatedBrand =
    brand.trim() !== "" && !trainedBrandSet.has(brand.trim().toLowerCase());
  const availableModels = getModelsForBrand(brand);

  // Applies only to a NEW prefill. It deliberately does not depend on `brand`,
  // so changing the brand afterwards never reapplies a stale prefill.
  /* eslint-disable react-hooks/set-state-in-effect -- prefill and form edits are external input synced into local form state */
  useEffect(() => {
    if (!prefillData) return;

    const targetBrand = prefillData.brand;
    if (targetBrand) {
      setBrand(targetBrand);
      const models = getModelsForBrand(targetBrand);
      const match = prefillData.sneaker_name
        ? models.find((m) => m.name.toLowerCase() === prefillData.sneaker_name?.toLowerCase())
        : undefined;

      if (match) {
        setSneakerName(match.name);
        setIsCustomModel(false);
        setCustomModelName("");
      } else if (prefillData.sneaker_name) {
        setSneakerName(prefillData.sneaker_name);
        setIsCustomModel(true);
        setCustomModelName(prefillData.sneaker_name);
      } else if (models.length > 0) {
        setSneakerName(models[0].name);
        setIsCustomModel(false);
        setCustomModelName("");
      }
    } else if (prefillData.sneaker_name) {
      setSneakerName(prefillData.sneaker_name);
      setIsCustomModel(true);
      setCustomModelName(prefillData.sneaker_name);
    }

    if (prefillData.retail_price !== undefined) setRetailPrice(prefillData.retail_price);
    if (prefillData.shoe_size !== undefined) setShoeSize(prefillData.shoe_size);
    if (prefillData.days_since_release !== undefined) {
      setDaysSinceRelease(prefillData.days_since_release);
    }
    if (prefillData.threshold !== undefined) setThreshold(prefillData.threshold);
    setErrorMsg(null);
  }, [prefillData]);

  useEffect(() => {
    setErrorMsg(null);
  }, [brand, sneakerName, customModelName, retailPrice, shoeSize, daysSinceRelease, threshold]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    const match = getModelsForBrand(brand).find((m) => m.name === selectedModelName);
    if (match) {
      setRetailPrice(match.retail);
      setDaysSinceRelease(match.days);
      if (match.size) setShoeSize(match.size);
    }
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    setErrorMsg(null);

    if (!brand || brand.trim() === "") {
      setErrorMsg("Choose a brand before checking profit.");
      return;
    }
    if (!Number.isFinite(retailPrice) || retailPrice <= 0) {
      setErrorMsg("Retail price must be greater than $0.");
      return;
    }
    if (retailPrice > MAX_RETAIL_PRICE) {
      setErrorMsg(`Retail price cannot exceed $${MAX_RETAIL_PRICE.toLocaleString()}.`);
      return;
    }
    if (!Number.isFinite(shoeSize) || shoeSize < 3.5 || shoeSize > 18) {
      setErrorMsg("Choose a US shoe size between 3.5 and 18.");
      return;
    }
    if (!Number.isFinite(daysSinceRelease) || daysSinceRelease < 0) {
      setErrorMsg("Days since release cannot be negative.");
      return;
    }
    if (daysSinceRelease > MAX_DAYS_SINCE_RELEASE) {
      setErrorMsg(`Days since release cannot exceed ${MAX_DAYS_SINCE_RELEASE.toLocaleString()}.`);
      return;
    }

    try {
      await onSubmit({
        brand,
        retail_price: Number(retailPrice),
        shoe_size: Number(shoeSize),
        days_since_release: Number(daysSinceRelease),
        sneaker_name: (isCustomModel ? customModelName.trim() : sneakerName.trim()) || undefined,
        threshold: Number(threshold),
      });
    } catch {
      setErrorMsg("The check failed. Review the inputs or try again.");
    }
  };

  return (
    <div className="material-card w-full p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-5">
        <div>
          <p className="text-12 font-semibold uppercase tracking-[0.16em] text-accent-readable">Calculator</p>
          <h2 className="mt-1 text-22 font-extrabold tracking-tight text-ink-1 sm:text-28">
            Check a pair
          </h2>
          <p className="mt-1 max-w-md text-14 text-ink-3">
            Enter the pair and your target. The verdict compares projected return with that target.
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
          className="inline-flex items-center gap-1.5 rounded-card border border-hairline bg-inset px-3 py-2 text-12 font-semibold text-ink-3 transition-colors hover:text-ink-1"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset
        </button>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="brand-select" className="mb-2 block text-14 font-semibold text-ink-2">
            Brand
          </label>
          <div className="relative">
            <select
              id="brand-select"
              value={brand}
              onChange={(event) => handleBrandSelect(event.target.value)}
              className="inset-field w-full appearance-none px-4 py-3 pr-11 text-16 font-semibold text-ink-1"
            >
              <optgroup label="Trained (StockX)">
                {brandsList
                  .filter((b) => trainedBrandSet.has(b.toLowerCase()))
                  .map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
              </optgroup>
              {brandsList.some((b) => !trainedBrandSet.has(b.toLowerCase())) && (
                <optgroup label="Extrapolated (not in training data)">
                  {brandsList
                    .filter((b) => !trainedBrandSet.has(b.toLowerCase()))
                    .map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 text-ink-3 [transform:translateY(-50%)]" aria-hidden="true" />
          </div>
          {isExtrapolatedBrand && (
            <div className="mt-2 flex items-start gap-2 rounded-card border border-warn/40 bg-warn/10 px-3 py-2 text-12 leading-snug text-warn">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                {brand} was not in the training data. The model will still estimate a price; treat
                the margin with extra skepticism.
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="model-select" className="mb-2 block text-14 font-semibold text-ink-2">
            Model
          </label>
          <div className="relative">
            <select
              id="model-select"
              value={isCustomModel ? "__CUSTOM__" : sneakerName}
              onChange={(event) => handleModelChange(event.target.value)}
              className="inset-field w-full appearance-none px-4 py-3 pr-11 text-16 font-semibold text-ink-1"
            >
              {availableModels.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
              <option value="__CUSTOM__">Other — type a model name</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 text-ink-3 [transform:translateY(-50%)]" aria-hidden="true" />
          </div>
          {isCustomModel && (
            <input
              id="custom-model-input"
              type="text"
              value={customModelName}
              onChange={(event) => {
                setCustomModelName(event.target.value);
                setSneakerName(event.target.value);
              }}
              placeholder="Model name"
              autoFocus
              className="inset-field mt-2 w-full px-4 py-3 text-16 text-ink-1 placeholder:text-ink-3"
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="retail-input" className="mb-2 block text-14 font-semibold text-ink-2">
              Retail price
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 font-mono text-16 font-bold text-accent-readable [transform:translateY(-50%)]">
                $
              </span>
              <input
                id="retail-input"
                type="number"
                step="1"
                min="1"
                max={MAX_RETAIL_PRICE}
                value={retailPrice}
                onChange={(event) => setRetailPrice(Number(event.target.value))}
                className="inset-field w-full py-3 pl-8 pr-4 font-mono text-16 font-bold tabular text-ink-1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="size-select" className="mb-2 block text-14 font-semibold text-ink-2">
              Shoe size
            </label>
            <div className="relative">
              <select
                id="size-select"
                value={shoeSize}
                onChange={(event) => setShoeSize(Number(event.target.value))}
                className="inset-field w-full appearance-none px-4 py-3 pr-11 font-mono text-16 font-bold tabular text-ink-1"
              >
                {SHOE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    US {size.toFixed(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 text-ink-3 [transform:translateY(-50%)]" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="days-input" className="text-14 font-semibold text-ink-2">
              Days since release
            </label>
            <span className="font-mono text-14 font-bold tabular text-accent-readable">
              {daysSinceRelease}d
            </span>
          </div>
          <div className="flex items-center gap-4">
            <input
              id="days-slider"
              type="range"
              min="0"
              max="365"
              step="1"
              value={Math.min(daysSinceRelease, 365)}
              onChange={(event) => setDaysSinceRelease(Number(event.target.value))}
              aria-label="Days since release slider"
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-inset [accent-color:var(--accent)]"
            />
            <input
              id="days-input"
              type="number"
              min="0"
              max={MAX_DAYS_SINCE_RELEASE}
              value={daysSinceRelease}
              onChange={(event) => setDaysSinceRelease(Math.max(0, Number(event.target.value)))}
              className="inset-field w-24 px-3 py-2 text-center font-mono text-14 font-bold tabular text-ink-1"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAY_PRESETS.map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => setDaysSinceRelease(preset.days)}
                aria-pressed={daysSinceRelease === preset.days}
                className={`rounded-card border px-3 py-1.5 text-12 font-semibold transition-colors ${
                  daysSinceRelease === preset.days
                    ? "border-accent bg-accent/10 text-accent-readable"
                    : "border-hairline bg-inset text-ink-3 hover:text-ink-1"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-12 text-ink-3">Number of days since release drives the time factor.</p>
        </div>

        <fieldset>
          <legend className="mb-2 text-14 font-semibold text-ink-2">
            Buy if profit ≥ {Math.round(threshold * 100)}%
          </legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Minimum return to recommend buying">
            {THRESHOLD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={threshold === option.value}
                tabIndex={threshold === option.value ? 0 : -1}
                  onClick={() => setThreshold(option.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key !== "ArrowRight" &&
                      event.key !== "ArrowDown" &&
                      event.key !== "ArrowLeft" &&
                      event.key !== "ArrowUp"
                    ) {
                      return;
                    }
                    event.preventDefault();
                    const currentIndex = THRESHOLD_OPTIONS.findIndex((item) => item.value === threshold);
                    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
                    const nextIndex =
                      (currentIndex + step + THRESHOLD_OPTIONS.length) % THRESHOLD_OPTIONS.length;
                    setThreshold(THRESHOLD_OPTIONS[nextIndex].value);
                    event.currentTarget.parentElement
                      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
                      [nextIndex]?.focus();
                  }}
                className={`rounded-card border px-3 py-2.5 text-center transition-colors ${
                  threshold === option.value
                    ? "border-accent bg-accent text-on-accent"
                    : "border-hairline bg-inset text-ink-2 hover:text-ink-1"
                }`}
              >
                <span className="block font-mono text-16 font-bold tabular">{option.label}</span>
                <span className="block text-12 opacity-80">{option.hint}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-12 text-ink-3">
            Your verdict is COP only when projected ROI clears this target.
          </p>
        </fieldset>

        {errorMsg && (
          <div role="alert" className="flex items-start gap-2 rounded-card border border-drop/50 bg-drop/10 px-3 py-2.5 text-14 text-drop">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-card bg-accent px-6 py-3.5 text-16 font-extrabold text-on-accent transition-transform duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Checking…" : "Get verdict"}
          {!isLoading && <ArrowRight className="size-4" aria-hidden="true" />}
        </button>
      </form>
    </div>
  );
}
