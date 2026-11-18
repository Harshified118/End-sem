"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Bookmark, Search, X } from "lucide-react";
import type { HealthResponse } from "@/lib/api";
import { REFERENCE_SNEAKERS, type CatalogSneaker } from "@/lib/sneakers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { scrollToSection } from "@/lib/scroll";

export interface HeaderProps {
  health?: HealthResponse | null;
  onRefreshHealth?: () => void;
  onSelectSneaker?: (sneaker: CatalogSneaker) => void;
}

export function Header({ health, onRefreshHealth, onSelectSneaker }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const modelOnline = Boolean(health?.model_loaded);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REFERENCE_SNEAKERS.slice(0, 5);
    return REFERENCE_SNEAKERS.filter((item) =>
      `${item.name} ${item.brand}`.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      } else if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const select = useCallback(
    (item: CatalogSneaker) => {
      onSelectSneaker?.(item);
      setQuery("");
      setHighlighted(0);
      setOpen(false);
      inputRef.current?.blur();
    },
    [onSelectSneaker]
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setHighlighted((prev) => (prev + delta + matches.length) % Math.max(matches.length, 1));
    } else if (event.key === "Enter" && matches.length > 0) {
      event.preventDefault();
      select(matches[highlighted] ?? matches[0]);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex shrink-0 items-center gap-2 text-ink-1 no-underline">
          <span className="grid size-6 place-items-center rounded-card bg-surface text-accent-readable ring-1 ring-hairline">
            <span className="size-2 rounded-full bg-accent" />
          </span>
          <span className="text-16 font-extrabold tracking-tight">
            Drop<span className="text-ink-3">Or</span>Cop
          </span>
        </a>

        <div ref={rootRef} className="relative min-w-0 flex-1 sm:mx-auto sm:max-w-md">
          <div className="flex h-8 items-center gap-2 rounded-card border border-hairline bg-inset px-2.5 focus-within:border-accent-readable">
            <Search className="size-3.5 shrink-0 text-ink-3" aria-hidden="true" />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded={open && matches.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-label="Search sneakers"
              aria-activedescendant={matches[highlighted] ? `${listId}-${matches[highlighted].id}` : undefined}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlighted(0);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Search sneakers"
              className="min-w-0 flex-1 bg-transparent text-14 text-ink-1 placeholder:text-ink-3 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setHighlighted(0);
                  inputRef.current?.focus();
                }}
                className="text-ink-3 transition-opacity hover:text-ink-1"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <kbd className="hidden rounded border border-hairline px-1 text-12 text-ink-3 sm:block">⌘K</kbd>
            )}
          </div>

          {open && matches.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Sneaker suggestions"
              className="material-card absolute left-0 right-0 top-9 z-50 overflow-hidden p-1"
            >
              {matches.map((item, index) => (
                <li
                  key={item.id}
                  id={`${listId}-${item.id}`}
                  role="option"
                  aria-selected={index === highlighted}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    select(item);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-card px-2.5 py-2 text-left transition-colors ${
                    index === highlighted ? "bg-accent/10" : "hover:bg-ink-1/5"
                  }`}
                >
                  <span className="truncate text-14 text-ink-1">{item.name}</span>
                  <span className="shrink-0 font-mono text-12 tabular text-ink-3">${item.retail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ThemeToggle />

        <button
          type="button"
          onClick={() => scrollToSection("wishlist-section")}
          title="View Wishlist"
          aria-label="View Wishlist"
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-card border border-hairline bg-surface px-2.5 text-12 font-semibold text-ink-1 transition-all hover:border-accent hover:text-accent-readable sm:px-3"
        >
          <Bookmark className="size-3.5 text-accent-readable" aria-hidden="true" />
          <span className="hidden sm:inline">Wishlist</span>
          <span className="ml-0.5 rounded-full bg-accent/15 px-1.5 py-0.2 font-mono text-11 font-bold text-accent-readable">
            {REFERENCE_SNEAKERS.length}
          </span>
        </button>
      </div>
    </header>
  );
}
