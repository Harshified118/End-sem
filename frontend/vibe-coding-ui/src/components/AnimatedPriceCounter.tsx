"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedPriceCounterProps {
  value: number;
  duration?: number;
}

export function AnimatedPriceCounter({ value, duration = 800 }: AnimatedPriceCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const displayRef = useRef<number>(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    displayRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const endValue = Number.isFinite(value) ? value : 0;

    if (reduce || duration <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced-motion path synchronises the counter to its target
      setDisplayValue(endValue);
      return;
    }

    let startTimestamp: number | null = null;
    const from = Number.isFinite(displayRef.current) ? displayRef.current : 0;
    if (from === endValue) return;

    const cancel = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(from + (endValue - from) * eased);
      if (progress < 1) rafRef.current = window.requestAnimationFrame(step);
      else rafRef.current = null;
    };

    cancel();
    rafRef.current = window.requestAnimationFrame(step);
    return cancel;
  }, [value, duration]);

  return (
    <span className="font-mono tabular-nums">
      ${displayValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}
