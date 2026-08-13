import { beforeEach, describe, expect, it } from "vitest";

import { lineKey, selectCount, unitPrice, useCart } from "@/lib/store/cart";

/**
 * c01 is ₹340 and c02 is ₹420 in the menu data. Sizes multiply by
 * S 1, M 1.22, L 1.45 and round, so c01 costs 340 / 415 / 493.
 */
const reset = () =>
  useCart.setState({ lines: [], coupon: null, couponError: null, compare: [], favorites: [] });

const state = () => useCart.getState();

beforeEach(reset);

describe("lineKey", () => {
  it("distinguishes the same item in different sizes", () => {
    expect(lineKey({ id: "c01", size: "M" })).not.toBe(lineKey({ id: "c01", size: "L" }));
  });

  it("matches the same item and size", () => {
    expect(lineKey({ id: "c01", size: "M" })).toBe(lineKey({ id: "c01", size: "M" }));
  });
});

describe("unitPrice", () => {
  it("applies the size multiplier and rounds", () => {
    expect(unitPrice("c01", "S")).toBe(340);
    expect(unitPrice("c01", "M")).toBe(415);
    expect(unitPrice("c01", "L")).toBe(493);
  });

  it("returns zero for an item that is not on the menu", () => {
    expect(unitPrice("does-not-exist", "M")).toBe(0);
  });
});

describe("add", () => {
  it("creates a line, defaulting to a medium", () => {
    state().add("c01");
    expect(state().lines).toEqual([{ id: "c01", size: "M", qty: 1 }]);
  });

  it("merges a repeat of the same item and size", () => {
    state().add("c01", "M", 2);
    state().add("c01", "M", 3);
    expect(state().lines).toHaveLength(1);
    expect(state().lines[0].qty).toBe(5);
  });

  it("keeps the same drink in two sizes as separate lines", () => {
    state().add("c01", "M");
    state().add("c01", "L");
    expect(state().lines).toHaveLength(2);
  });

  it("keeps different items separate", () => {
    state().add("c01", "M");
    state().add("c02", "M");
    expect(state().lines).toHaveLength(2);
  });

  it("caps a merged line at 99", () => {
    state().add("c01", "M", 60);
    state().add("c01", "M", 60);
    expect(state().lines[0].qty).toBe(99);
  });
});

describe("setQty", () => {
  it("replaces the quantity", () => {
    state().add("c01", "M", 2);
    state().setQty(lineKey({ id: "c01", size: "M" }), 7);
    expect(state().lines[0].qty).toBe(7);
  });

  it("caps at 99", () => {
    state().add("c01", "M");
    state().setQty(lineKey({ id: "c01", size: "M" }), 500);
    expect(state().lines[0].qty).toBe(99);
  });

  it("removes the line at zero or below", () => {
    state().add("c01", "M");
    state().setQty(lineKey({ id: "c01", size: "M" }), 0);
    expect(state().lines).toEqual([]);
  });

  it("leaves other lines alone", () => {
    state().add("c01", "M");
    state().add("c02", "M");
    state().setQty(lineKey({ id: "c01", size: "M" }), 0);
    expect(state().lines.map((l) => l.id)).toEqual(["c02"]);
  });
});

describe("remove and clear", () => {
  it("removes only the keyed line", () => {
    state().add("c01", "M");
    state().add("c01", "L");
    state().remove(lineKey({ id: "c01", size: "M" }));
    expect(state().lines).toEqual([{ id: "c01", size: "L", qty: 1 }]);
  });

  it("ignores a key that is not in the cart", () => {
    state().add("c01", "M");
    state().remove(lineKey({ id: "c99", size: "M" }));
    expect(state().lines).toHaveLength(1);
  });

  it("clear empties the cart and drops the coupon", () => {
    state().add("c01", "M", 3);
    state().applyCoupon("GOLDCLUB");
    state().clear();
    expect(state().lines).toEqual([]);
    expect(state().coupon).toBeNull();
  });
});

describe("selectCount", () => {
  it("sums quantities rather than counting lines", () => {
    state().add("c01", "M", 2);
    state().add("c02", "L", 3);
    expect(state().lines).toHaveLength(2);
    expect(selectCount(state())).toBe(5);
  });

  it("is zero for an empty cart", () => {
    expect(selectCount({ lines: [] })).toBe(0);
  });
});

describe("favorites and compare", () => {
  it("toggles a favorite on and off", () => {
    state().toggleFavorite("c01");
    expect(state().favorites).toContain("c01");
    state().toggleFavorite("c01");
    expect(state().favorites).not.toContain("c01");
  });

  it("keeps only the three most recent comparisons", () => {
    for (const id of ["c01", "c02", "c03", "c04"]) state().toggleCompare(id);
    expect(state().compare).toEqual(["c02", "c03", "c04"]);
  });

  it("removes an item already being compared", () => {
    state().toggleCompare("c01");
    state().toggleCompare("c01");
    expect(state().compare).toEqual([]);
  });
});

describe("markViewed", () => {
  it("puts the newest first without duplicating", () => {
    useCart.setState({ recentlyViewed: [] });
    state().markViewed("c01");
    state().markViewed("c02");
    state().markViewed("c01");
    expect(state().recentlyViewed).toEqual(["c01", "c02"]);
  });

  it("keeps at most eight", () => {
    useCart.setState({ recentlyViewed: [] });
    for (let i = 1; i <= 12; i++) state().markViewed(`c${String(i).padStart(2, "0")}`);
    expect(state().recentlyViewed).toHaveLength(8);
    expect(state().recentlyViewed[0]).toBe("c12");
  });
});
