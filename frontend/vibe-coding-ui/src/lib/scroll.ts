"use client";

/**
 * Scroll helper indirection.
 *
 * Lenis smooth-scrolls the window by virtualising native scroll. Calling
 * `window.scrollTo` underneath Lenis fights the easing loop, so sections
 * register themselves here instead and ask Lenis (when present) to move.
 */

interface LenisLike {
  scrollTo: (
    target: HTMLElement | string,
    options?: { offset?: number; duration?: number }
  ) => void;
}

let activeLenis: LenisLike | null = null;

export function registerLenis(lenis: LenisLike | null) {
  activeLenis = lenis;
}

export function unregisterLenis(lenis: LenisLike | null) {
  if (activeLenis === lenis) activeLenis = null;
}

export function scrollToSection(id: string, offset = -96): boolean {
  const element = document.getElementById(id);
  if (!element) return false;

  if (activeLenis) {
    activeLenis.scrollTo(element, { offset, duration: 1.1 });
    return true;
  }

  const top = element.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: "smooth" });
  return true;
}
