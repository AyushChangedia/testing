import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TOAST_MS, useUI } from "@/lib/store/ui";

/**
 * The store behind every overlay on the site: the cart drawer, the command
 * palette, the quick view, the toasts, and the little image that flies into
 * the cart. None of it had a test, and none of it fails loudly — a toast that
 * never dismisses or an animation that silently skips just makes the site
 * feel slightly broken.
 */

const state = () => useUI.getState();

const reset = () =>
  useUI.setState({
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
  });

beforeEach(reset);
afterEach(() => vi.useRealTimers());

/* ------------------------------------------------------------- overlays -- */

describe("overlays", () => {
  it("open and close independently", () => {
    state().setCartOpen(true);
    expect(state().cartOpen).toBe(true);
    expect(state().paletteOpen).toBe(false);

    state().setPaletteOpen(true);
    state().setCartOpen(false);
    expect(state().paletteOpen).toBe(true);
    expect(state().cartOpen).toBe(false);
  });

  it("the quick view holds an id, and null closes it", () => {
    state().setQuickView("c01");
    expect(state().quickViewId).toBe("c01");
    state().setQuickView(null);
    expect(state().quickViewId).toBeNull();
  });

  it("sound toggles both ways", () => {
    expect(state().soundOn).toBe(false);
    state().toggleSound();
    expect(state().soundOn).toBe(true);
    state().toggleSound();
    expect(state().soundOn).toBe(false);
  });

  it("the locale is settable and starts in English", () => {
    expect(state().locale).toBe("en");
    state().setLocale("hi");
    expect(state().locale).toBe("hi");
  });
});

/* ---------------------------------------------------------------- toasts -- */

describe("toasts", () => {
  it("a toast goes up with the default tone", () => {
    state().toast({ title: "Added" });
    expect(state().toasts).toHaveLength(1);
    expect(state().toasts[0]).toMatchObject({ title: "Added", tone: "default" });
  });

  it("a tone given is a tone kept", () => {
    state().toast({ title: "Gone", tone: "danger" });
    expect(state().toasts[0].tone).toBe("danger");
  });

  it("an explicit undefined tone still renders as the default", () => {
    // The default was spread over by `...t`, so a caller passing
    // `tone: undefined` — which an optional prop does — put undefined back on
    // top of it, and an undefined tone renders as an unstyled toast.
    state().toast({ title: "Added", tone: undefined });
    expect(state().toasts[0].tone).toBe("default");
  });

  it("every toast gets its own id", () => {
    const ids = [
      state().toast({ title: "one" }),
      state().toast({ title: "two" }),
      state().toast({ title: "three" }),
    ];
    expect(new Set(ids).size).toBe(3);
    expect(state().toasts.map((t) => t.id)).toEqual(ids);
  });

  it("dismissing removes only that one", () => {
    const first = state().toast({ title: "one" });
    state().toast({ title: "two" });

    state().dismissToast(first);
    expect(state().toasts.map((t) => t.title)).toEqual(["two"]);
  });

  it("dismissing one that is already gone changes nothing", () => {
    state().toast({ title: "one" });
    state().dismissToast(9999);
    expect(state().toasts).toHaveLength(1);
  });

  it("a toast dismisses itself after its own time", () => {
    vi.useFakeTimers();
    state().toast({ title: "one" });
    expect(state().toasts).toHaveLength(1);

    vi.advanceTimersByTime(TOAST_MS - 1);
    expect(state().toasts).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(state().toasts).toHaveLength(0);
  });

  it("toasts dismiss in the order they went up, not all at once", () => {
    vi.useFakeTimers();
    state().toast({ title: "first" });
    vi.advanceTimersByTime(1000);
    state().toast({ title: "second" });

    vi.advanceTimersByTime(TOAST_MS - 1000);
    expect(state().toasts.map((t) => t.title)).toEqual(["second"]);
  });
});

/* ------------------------------------------------------------------ fly -- */

describe("the fly-to-cart animation", () => {
  const payload = { from: { x: 10, y: 20 }, image: "/c01.jpg", label: "Latte" };

  it("carries the payload through", () => {
    state().triggerFly(payload);
    expect(state().fly).toMatchObject(payload);
  });

  it("two in the same millisecond get different keys", () => {
    /**
     * The key is React's. It was Date.now(), so a double-click or the "add 2"
     * button produced the same one twice, React treated the second fly as the
     * first still being there, and the animation never played. Easy to miss,
     * because it only skips when somebody is clicking quickly — which is
     * exactly when they are watching.
     */
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    state().triggerFly(payload);
    const first = state().fly!.key;
    state().triggerFly(payload);
    const second = state().fly!.key;

    expect(second).not.toBe(first);
  });

  it("keys keep going up, so React never reuses one", () => {
    const keys: number[] = [];
    for (let i = 0; i < 20; i += 1) {
      state().triggerFly(payload);
      keys.push(state().fly!.key);
    }
    expect(new Set(keys).size).toBe(20);
    expect([...keys].sort((a, b) => a - b)).toEqual(keys);
  });

  it("each one pulses the cart badge", () => {
    const before = state().cartPulse;
    state().triggerFly(payload);
    state().triggerFly(payload);
    expect(state().cartPulse).toBe(before + 2);
  });

  it("clearing it leaves the pulse count alone", () => {
    state().triggerFly(payload);
    const pulses = state().cartPulse;

    state().clearFly();
    expect(state().fly).toBeNull();
    expect(state().cartPulse).toBe(pulses);
  });
});

/* ---------------------------------------------------------------- theme -- */

describe("the theme", () => {
  /**
   * The only part of this store that writes outside itself: a class on <html>
   * for the stylesheet, and a localStorage key the pre-paint script in
   * layout.tsx reads back. Both have to happen, and neither may throw —
   * private browsing refuses the write, and an exception here would take the
   * whole toggle with it.
   */
  afterEach(() => {
    document.documentElement.classList.remove("light");
    localStorage.clear();
  });

  it("puts the class the stylesheet reads on the document", () => {
    state().setTheme("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("takes it off again", () => {
    state().setTheme("light");
    state().setTheme("dark");
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("stores it under the key the pre-paint script reads", () => {
    // layout.tsx reads "noir-theme" before first paint to avoid a light-mode
    // flash. A different key here would mean the flash came back, silently.
    state().setTheme("light");
    expect(localStorage.getItem("noir-theme")).toBe("light");
  });

  it("stores dark as well, so a switch back survives a reload", () => {
    state().setTheme("light");
    state().setTheme("dark");
    expect(localStorage.getItem("noir-theme")).toBe("dark");
  });

  it("the store and the document always agree", () => {
    for (const theme of ["light", "dark", "light"] as const) {
      state().setTheme(theme);
      expect(state().theme).toBe(theme);
      expect(document.documentElement.classList.contains("light")).toBe(theme === "light");
    }
  });

  it("still switches when storage refuses the write", () => {
    // Private browsing throws on setItem. The theme just does not persist;
    // it must not take the toggle down with it.
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => state().setTheme("light")).not.toThrow();
    expect(state().theme).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);

    setItem.mockRestore();
  });
});
