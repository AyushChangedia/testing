"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Coupon } from "@/lib/types";
import { getItem, SIZE_MULTIPLIER } from "@/lib/data/menu";

export const COUPONS: Coupon[] = [
  { code: "NOIR20", kind: "percent", value: 20, minSubtotal: 800, label: "20% off orders over ₹800" },
  { code: "FIRSTCUP", kind: "flat", value: 150, minSubtotal: 500, label: "₹150 off your first order" },
  { code: "GOLDCLUB", kind: "percent", value: 12, minSubtotal: 0, label: "12% member discount" },
];

export const DELIVERY_FEE = 49;
export const FREE_DELIVERY_THRESHOLD = 1500;
export const TAX_RATE = 0.05;
export const POINTS_PER_RUPEE = 0.1;

interface CartState {
  lines: CartLine[];
  coupon: Coupon | null;
  couponError: string | null;
  favorites: string[];
  recentlyViewed: string[];
  compare: string[];
  points: number;

  add: (id: string, size?: CartLine["size"], qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  toggleFavorite: (id: string) => void;
  markViewed: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
}

/** Lines are keyed by item + size so the same drink in two sizes stays separate. */
export const lineKey = (l: Pick<CartLine, "id" | "size">) => `${l.id}__${l.size}`;

export function unitPrice(id: string, size: CartLine["size"]) {
  const item = getItem(id);
  if (!item) return 0;
  return Math.round(item.price * SIZE_MULTIPLIER[size]);
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      couponError: null,
      favorites: [],
      recentlyViewed: [],
      compare: [],
      points: 240,

      add: (id, size = "M", qty = 1) =>
        set((s) => {
          const key = lineKey({ id, size });
          const existing = s.lines.find((l) => lineKey(l) === key);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                lineKey(l) === key ? { ...l, qty: Math.min(99, l.qty + qty) } : l,
              ),
            };
          }
          return { lines: [...s.lines, { id, size, qty }] };
        }),

      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => lineKey(l) !== key) })),

      setQty: (key, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => lineKey(l) !== key)
              : s.lines.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(99, qty) } : l)),
        })),

      clear: () => set({ lines: [], coupon: null, couponError: null }),

      applyCoupon: (code) => {
        const found = COUPONS.find((c) => c.code === code.trim().toUpperCase());
        if (!found) {
          set({ couponError: "That code isn't valid. Try NOIR20 or FIRSTCUP." });
          return false;
        }
        const sub = selectSubtotal(get());
        if (sub < found.minSubtotal) {
          set({
            couponError: `Add ${found.minSubtotal - sub > 0 ? `₹${found.minSubtotal - sub} more` : "more"} to use ${found.code}.`,
          });
          return false;
        }
        set({ coupon: found, couponError: null });
        return true;
      },

      removeCoupon: () => set({ coupon: null, couponError: null }),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),

      markViewed: (id) =>
        set((s) => ({ recentlyViewed: [id, ...s.recentlyViewed.filter((v) => v !== id)].slice(0, 8) })),

      toggleCompare: (id) =>
        set((s) => ({
          compare: s.compare.includes(id)
            ? s.compare.filter((c) => c !== id)
            : [...s.compare, id].slice(-3),
        })),

      clearCompare: () => set({ compare: [] }),
    }),
    {
      name: "noir-cafe-cart",
      partialize: (s) => ({
        lines: s.lines,
        favorites: s.favorites,
        recentlyViewed: s.recentlyViewed,
        points: s.points,
      }),
    },
  ),
);

// ---- Selectors (pure, so they can be reused server-side in tests) ----

export function selectCount(s: Pick<CartState, "lines">) {
  return s.lines.reduce((n, l) => n + l.qty, 0);
}

export function selectSubtotal(s: Pick<CartState, "lines">) {
  return s.lines.reduce((n, l) => n + unitPrice(l.id, l.size) * l.qty, 0);
}

export function selectDiscount(s: Pick<CartState, "lines" | "coupon">) {
  if (!s.coupon) return 0;
  const sub = selectSubtotal(s);
  if (sub < s.coupon.minSubtotal) return 0;
  return s.coupon.kind === "percent"
    ? Math.round((sub * s.coupon.value) / 100)
    : Math.min(s.coupon.value, sub);
}

export function selectDelivery(s: Pick<CartState, "lines" | "coupon">) {
  const sub = selectSubtotal(s) - selectDiscount(s);
  if (sub <= 0) return 0;
  return sub >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function selectTax(s: Pick<CartState, "lines" | "coupon">) {
  return Math.round((selectSubtotal(s) - selectDiscount(s)) * TAX_RATE);
}

export function selectTotal(s: Pick<CartState, "lines" | "coupon">) {
  const sub = selectSubtotal(s);
  if (sub === 0) return 0;
  return sub - selectDiscount(s) + selectTax(s) + selectDelivery(s);
}

export function selectEarnedPoints(s: Pick<CartState, "lines" | "coupon">) {
  return Math.round(selectTotal(s) * POINTS_PER_RUPEE);
}
