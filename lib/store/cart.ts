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

/** The most of one line anybody can order. */
export const MAX_QTY = 99;

/** Hold a quantity between one and the cap. */
const clampQty = (qty: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(qty)));

/**
 * What a quantity actually means, before it reaches a line.
 *
 * Returns 0 for anything that is not a real quantity, and the caller treats
 * that as "add nothing" or "remove the line".
 *
 * add() used to put whatever it was given straight onto a line: a negative
 * quantity made a negative subtotal, and a negative subtotal made a negative
 * total — an order the checkout would have been happy to take. A fraction was
 * worse, because it looked right: 1.5 lattes priced as 1.5 lattes, rounded
 * nowhere, and displayed as "1.5".
 */
const normaliseQty = (qty: number) => {
  if (!Number.isFinite(qty) || qty <= 0) return 0;
  return clampQty(qty);
};

/**
 * Drop a coupon the cart has stopped qualifying for, and say why.
 *
 * Coupons were checked once, when applied, and never again. Take ₹900 of
 * coffee, enter NOIR20, then remove a cup: selectDiscount quietly returns 0
 * because the subtotal is under the minimum, while the chip still reads
 * "NOIR20 applied". The discount is gone, the badge says it is not, and
 * nothing in between explains the ₹180 that moved.
 *
 * Removing it outright rather than leaving it inert: a coupon that is applied
 * and doing nothing is the state that confused the customer in the first
 * place. The message says what it would take to earn it back.
 */
function withValidCoupon<T extends Pick<CartState, "lines" | "coupon" | "couponError">>(next: T) {
  if (!next.coupon) return next;

  const sub = selectSubtotal(next);
  if (sub >= next.coupon.minSubtotal) return next;

  return {
    ...next,
    coupon: null,
    couponError:
      sub === 0
        ? `${next.coupon.code} removed — your cart is empty.`
        : `${next.coupon.code} needs ₹${next.coupon.minSubtotal} — it has been removed.`,
  };
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
          const wanted = normaliseQty(qty);
          // Nothing to add. Returning the lines untouched rather than a line
          // of zero, which would show in the cart as an item you cannot buy.
          if (wanted === 0) return { lines: s.lines };

          // An id that is not on the menu priced at nothing and sat in the
          // cart as a blank row costing ₹0 — a stale link, a renamed item or
          // a typo in a card's props all produced one, and nothing anywhere
          // said so. unitPrice still answers 0 for an unknown id, because a
          // line already saved in localStorage may name an item since
          // withdrawn and the cart has to render it rather than throw.
          if (!getItem(id)) return { lines: s.lines };

          const key = lineKey({ id, size });
          const existing = s.lines.find((l) => lineKey(l) === key);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                lineKey(l) === key ? { ...l, qty: clampQty(l.qty + wanted) } : l,
              ),
            };
          }
          return { lines: [...s.lines, { id, size, qty: wanted }] };
        }),

      remove: (key) =>
        set((s) => withValidCoupon({ ...s, lines: s.lines.filter((l) => lineKey(l) !== key) })),

      setQty: (key, qty) =>
        set((s) => {
          const wanted = normaliseQty(qty);
          return withValidCoupon({
            ...s,
            lines:
              wanted === 0
                ? s.lines.filter((l) => lineKey(l) !== key)
                : s.lines.map((l) => (lineKey(l) === key ? { ...l, qty: wanted } : l)),
          });
        }),

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
