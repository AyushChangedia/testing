"use client";

import { create } from "zustand";

export interface FlyPayload {
  key: number;
  from: { x: number; y: number };
  image: string;
  label: string;
}

interface UIState {
  booted: boolean;
  introDone: boolean;
  cartOpen: boolean;
  paletteOpen: boolean;
  quickViewId: string | null;
  soundOn: boolean;
  theme: "dark" | "light";
  locale: "en" | "hi" | "fr";
  fly: FlyPayload | null;
  cartPulse: number;
  toasts: Array<{ id: number; title: string; body?: string; tone: "default" | "success" | "danger" }>;

  setBooted: (v: boolean) => void;
  setIntroDone: (v: boolean) => void;
  setCartOpen: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setQuickView: (id: string | null) => void;
  toggleSound: () => void;
  setTheme: (t: "dark" | "light") => void;
  setLocale: (l: "en" | "hi" | "fr") => void;
  triggerFly: (p: Omit<FlyPayload, "key">) => void;
  clearFly: () => void;
  toast: (t: { title: string; body?: string; tone?: "default" | "success" | "danger" }) => void;
  dismissToast: (id: number) => void;
}

let toastSeq = 0;

export const useUI = create<UIState>()((set, get) => ({
  booted: false,
  introDone: false,
  cartOpen: false,
  paletteOpen: false,
  quickViewId: null,
  soundOn: false,
  theme: "dark",
  locale: "en",
  fly: null,
  cartPulse: 0,
  toasts: [],

  setBooted: (v) => set({ booted: v }),
  setIntroDone: (v) => set({ introDone: v }),
  setCartOpen: (v) => set({ cartOpen: v }),
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  setQuickView: (id) => set({ quickViewId: id }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),

  setTheme: (t) => {
    set({ theme: t });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", t === "light");
      try {
        localStorage.setItem("noir-theme", t);
      } catch {
        /* private mode — theme just won't persist */
      }
    }
  },

  setLocale: (l) => set({ locale: l }),

  triggerFly: (p) => set({ fly: { ...p, key: Date.now() }, cartPulse: get().cartPulse + 1 }),
  clearFly: () => set({ fly: null }),

  toast: (t) => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, tone: "default", ...t }] }));
    setTimeout(() => get().dismissToast(id), 4000);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
