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
  /** @returns the toast's id, so a caller can dismiss it early. */
  toast: (t: { title: string; body?: string; tone?: "default" | "success" | "danger" }) => number;
  dismissToast: (id: number) => void;
}

let toastSeq = 0;
let flySeq = 0;

/** How long a toast stays up before it dismisses itself. */
export const TOAST_MS = 4000;

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

  // A counter, not Date.now(). The key is React's, and two adds inside the
  // same millisecond — a double-click, or the "add 2" button — produced the
  // same one, so React treated the second fly as the first still being there
  // and the animation never played. Easy to miss, because it only skips when
  // somebody is clicking quickly, which is exactly when they are watching.
  triggerFly: (p) => set({ fly: { ...p, key: ++flySeq }, cartPulse: get().cartPulse + 1 }),
  clearFly: () => set({ fly: null }),

  toast: (t) => {
    const id = ++toastSeq;
    // Spreading `t` over the default would put an explicit `tone: undefined`
    // back on top of it, and an undefined tone renders as an unstyled toast.
    // Taking the tone by name instead.
    const tone = t.tone ?? "default";
    set((s) => ({ toasts: [...s.toasts, { id, title: t.title, body: t.body, tone }] }));
    setTimeout(() => get().dismissToast(id), TOAST_MS);
    return id;
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
