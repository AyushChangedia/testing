import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Indian digit grouping (1,00,000) implemented by hand.
 *
 * `Intl.NumberFormat` is deliberately avoided for anything that lands in
 * server-rendered markup: Node and the browser can ship different ICU versions,
 * which produces different strings for the same number and trips a React
 * hydration mismatch. These are byte-identical everywhere.
 */
export function groupIndian(value: number) {
  const rounded = Math.round(Math.abs(value));
  const digits = String(rounded);
  const sign = value < 0 ? "-" : "";

  if (digits.length <= 3) return sign + digits;

  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return `${sign}${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}`;
}

export function formatPrice(value: number) {
  return `₹${groupIndian(value)}`;
}

export function formatPriceExact(value: number) {
  const whole = Math.floor(Math.abs(value));
  const paise = Math.round((Math.abs(value) - whole) * 100);
  return `${value < 0 ? "-" : ""}₹${groupIndian(whole)}.${String(paise).padStart(2, "0")}`;
}

/** Compact Indian notation: thousands (K), lakh (L), crore (Cr). */
export function formatCompact(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}${(abs / 1e7).toFixed(1)}Cr`;
  if (abs >= 1e5) return `${sign}${(abs / 1e5).toFixed(1)}L`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${Math.round(abs)}`;
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic 0–1 hash from a string — used for stable pseudo-random visuals. */
export function hash01(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/** Stable gradient pair derived from a string, for image fallbacks. */
export function gradientFor(seed: string): [string, string] {
  const h = hash01(seed);
  const hue = 18 + h * 34; // coffee/amber band only
  return [`hsl(${hue} 45% 16%)`, `hsl(${hue + 14} 38% 6%)`];
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Splits text into words then chars, preserving spaces, for per-letter animation. */
export function splitWords(text: string) {
  return text.split(" ").map((word) => ({ word, chars: Array.from(word) }));
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}
