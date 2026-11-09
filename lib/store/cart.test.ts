import { beforeEach, describe, expect, it } from "vitest";

import { MAX_QTY, lineKey, selectCount, selectSubtotal, unitPrice, useCart } from "@/lib/store/cart";

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


describe("quantities that are not quantities", () => {
  /**
   * add() put whatever it was given straight onto a line. A negative quantity
   * made a negative subtotal, and a negative subtotal made a negative total —
   * an order the checkout would have taken without complaint.
   */
  it("refuses a negative quantity rather than crediting the cart", () => {
    state().add("c01", "M", -5);
    expect(state().lines).toEqual([]);
    expect(selectSubtotal(state())).toBe(0);
  });

  it("does not let a negative quantity eat a line that is already there", () => {
    state().add("c01", "M", 2);
    state().add("c01", "M", -10);
    expect(state().lines[0].qty).toBe(2);
    expect(selectSubtotal(state())).toBeGreaterThan(0);
  });

  it("refuses a quantity of zero rather than adding a line you cannot buy", () => {
    state().add("c01", "M", 0);
    expect(state().lines).toEqual([]);
  });

  it("rounds a fraction down to whole cups", () => {
    // The worst of the three, because it looked right: 1.5 lattes, priced as
    // 1.5 lattes, and displayed as "1.5".
    state().add("c01", "M", 1.5);
    expect(state().lines[0].qty).toBe(1);
  });

  it("refuses NaN and Infinity", () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      reset();
      state().add("c01", "M", bad);
      expect(state().lines, String(bad)).toEqual([]);
    }
  });

  it("still caps a merged line at the maximum", () => {
    state().add("c01", "M", 90);
    state().add("c01", "M", 90);
    expect(state().lines[0].qty).toBe(MAX_QTY);
  });

  it("caps a single add at the maximum too", () => {
    state().add("c01", "M", 5000);
    expect(state().lines[0].qty).toBe(MAX_QTY);
  });

  it("setQty refuses a fraction and keeps the line whole", () => {
    state().add("c01", "M", 2);
    state().setQty(lineKey({ id: "c01", size: "M" }), 3.9);
    expect(state().lines[0].qty).toBe(3);
  });

  it("setQty removes the line for anything that is not a quantity", () => {
    for (const bad of [0, -3, NaN, Infinity]) {
      reset();
      state().add("c01", "M", 2);
      state().setQty(lineKey({ id: "c01", size: "M" }), bad);
      expect(state().lines, String(bad)).toEqual([]);
    }
  });

  it("the count is never negative, whatever it is given", () => {
    for (const bad of [-5, 0, NaN, 1.4]) {
      reset();
      state().add("c01", "M", bad);
      expect(selectCount(state()), String(bad)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("items that are not on the menu", () => {
  /**
   * An unknown id priced at nothing and sat in the cart as a blank row
   * costing ₹0. A stale link, a renamed item or a typo in a card's props all
   * produced one, and nothing anywhere said so — the row was simply there,
   * for free, through checkout.
   */
  it("refuses an id the menu does not have", () => {
    state().add("not-a-drink", "M", 1);
    expect(state().lines).toEqual([]);
  });

  it("refuses an empty id", () => {
    for (const bad of ["", " ", "C01", "c01 "]) {
      reset();
      state().add(bad, "M", 1);
      expect(state().lines, JSON.stringify(bad)).toEqual([]);
    }
  });

  it("leaves a real cart alone when a bad id arrives", () => {
    state().add("c01", "M", 2);
    state().add("ghost", "M", 3);
    expect(state().lines).toHaveLength(1);
    expect(state().lines[0].id).toBe("c01");
  });

  it("the subtotal never gains a free row", () => {
    state().add("ghost", "L", 5);
    expect(selectSubtotal(state())).toBe(0);
    expect(selectCount(state())).toBe(0);
  });

  it("a real item still goes in", () => {
    state().add("c01", "L", 2);
    expect(state().lines[0]).toEqual({ id: "c01", size: "L", qty: 2 });
  });

  it("unitPrice still answers for an unknown id rather than throwing", () => {
    // A line already saved in localStorage may name an item since withdrawn,
    // and the cart has to render it rather than crash on it.
    expect(unitPrice("withdrawn", "M")).toBe(0);
  });
});

describe("a coupon the cart stops qualifying for", () => {
  /**
   * Coupons were checked once, when applied, and never again. Take ₹900 of
   * coffee, enter NOIR20, remove a cup: the discount quietly became 0 while
   * the chip still read "NOIR20 applied". The badge said one thing, the total
   * said another, and nothing in between explained the ₹180 that moved.
   */
  it("is dropped when a line is removed", () => {
    state().add("c01", "M", 3); // 1245, over NOIR20's 800
    expect(state().applyCoupon("NOIR20")).toBe(true);

    state().remove(lineKey({ id: "c01", size: "M" }));
    expect(state().coupon).toBeNull();
  });

  it("is dropped when the quantity falls", () => {
    state().add("c01", "M", 3);
    state().applyCoupon("NOIR20");

    state().setQty(lineKey({ id: "c01", size: "M" }), 1);
    expect(state().coupon).toBeNull();
  });

  it("says what it would take to earn it back", () => {
    state().add("c01", "M", 3);
    state().applyCoupon("NOIR20");
    state().setQty(lineKey({ id: "c01", size: "M" }), 1);

    expect(state().couponError).toContain("NOIR20");
    expect(state().couponError).toContain("800");
  });

  it("says so plainly when the cart is emptied", () => {
    state().add("c01", "M", 3);
    state().applyCoupon("NOIR20");
    state().setQty(lineKey({ id: "c01", size: "M" }), 0);

    expect(state().coupon).toBeNull();
    expect(state().couponError).toMatch(/empty/i);
  });

  it("stays while the cart still qualifies", () => {
    state().add("c01", "M", 3); // 1245
    state().applyCoupon("NOIR20");

    state().setQty(lineKey({ id: "c01", size: "M" }), 2); // 830, still over 800
    expect(state().coupon?.code).toBe("NOIR20");
  });

  it("a coupon with no minimum is never dropped for being too small", () => {
    state().add("c01", "S", 1);
    expect(state().applyCoupon("GOLDCLUB")).toBe(true);

    state().setQty(lineKey({ id: "c01", size: "S" }), 1);
    expect(state().coupon?.code).toBe("GOLDCLUB");
  });

  it("adding more never drops a coupon", () => {
    state().add("c01", "M", 3);
    state().applyCoupon("NOIR20");

    state().add("c02", "L", 1);
    expect(state().coupon?.code).toBe("NOIR20");
  });

  it("an empty cart has no coupon to carry", () => {
    state().add("c01", "M", 3);
    state().applyCoupon("NOIR20");

    state().clear();
    expect(state().coupon).toBeNull();
    expect(state().couponError).toBeNull();
  });
});
