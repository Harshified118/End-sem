"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "day";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  // The inline bootstrap script already set the attribute before paint; mirror
  // it into React state before the first browser paint so the icon matches.
  useIsomorphicLayoutEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "day" || current === "dark") setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "day" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("droporcop-theme", next);
    } catch {
      // Storage may be blocked; the in-memory choice still applies.
    }
  };

  const label = theme === "dark" ? "Switch to day mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid size-8 shrink-0 place-items-center rounded-card border border-hairline bg-inset text-ink-2 transition-colors hover:text-accent-readable focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-readable"
    >
      {theme === "dark" ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
