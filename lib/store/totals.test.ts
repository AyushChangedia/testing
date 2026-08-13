import { beforeEach, describe, expect, it } from "vitest";

import {
  COUPONS,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  selectDelivery,
  selectDiscount,
  selectEarnedPoints,
  selectSubtotal,
  selectTax,
  selectTotal,
  useCart,
} from "@/lib/store/cart";

/**
 * Prices used below: c01 is ₹340 base, so M is ₹415 and L is ₹493.
 * Coupons: NOIR20 20% over ₹800, FIRSTCUP ₹150 flat over ₹500,
 * GOLDCLUB 12% with no minimum.
 */
const reset = () => useCart.setState({ lines: [], coupon: null, couponError: null });
const state = () => useCart.getState();
const couponBy = (code: string) => COUPONS.find((c) => c.code === code)!;

beforeEach(reset);

describe("selectSubtotal", () => {
  it("is zero for an empty cart", () => {
    expect(selectSubtotal({ lines: [] })).toBe(0);
  });

  it("multiplies each line by its size-adjusted price", () => {
    state().add("c01", "M", 2);
    expect(selectSubtotal(state())).toBe(830);
  });

  it("sums across lines", () => {
    state().add("c01", "M", 2); // 830
    state().add("c01", "L", 1); // 493
    expect(selectSubtotal(state())).toBe(1323);
  });
});

describe("applyCoupon", () => {
  it("accepts a valid code once the minimum is met", () => {
    state().add("c01", "M", 2); // 830, over NOIR20's 800
    expect(state().applyCoupon("NOIR20")).toBe(true);
    expect(state().coupon?.code).toBe("NOIR20");
    expect(state().couponError).toBeNull();
  });

  it("is case-insensitive and ignores surrounding whitespace", () => {
    state().add("c01", "M", 2);
    expect(state().applyCoupon("  noir20 ")).toBe(true);
    expect(state().coupon?.code).toBe("NOIR20");
  });

  it("rejects an unknown code without touching the applied coupon", () => {
    state().add("c01", "M", 2);
    state().applyCoupon("NOIR20");
    expect(state().applyCoupon("NOTACODE")).toBe(false);
    expect(state().coupon?.code).toBe("NOIR20");
    expect(state().couponError).toMatch(/isn't valid/);
  });

  it("refuses a coupon whose minimum the cart has not reached", () => {
    state().add("c01", "M", 1); // 415, under NOIR20's 800
    expect(state().applyCoupon("NOIR20")).toBe(false);
    expect(state().coupon).toBeNull();
  });

  it("says how much more is needed", () => {
    state().add("c01", "M", 1); // 415, so 385 short of 800
    state().applyCoupon("NOIR20");
    expect(state().couponError).toBe("Add ₹385 more to use NOIR20.");
  });

  it("applies a coupon with no minimum to any cart", () => {
    state().add("c01", "M", 1);
    expect(state().applyCoupon("GOLDCLUB")).toBe(true);
  });

  it("removeCoupon clears both the coupon and the error", () => {
    state().add("c01", "M", 1);
    state().applyCoupon("NOIR20"); // fails, sets an error
    state().removeCoupon();
    expect(state().coupon).toBeNull();
    expect(state().couponError).toBeNull();
  });
});

describe("selectDiscount", () => {
  it("is zero without a coupon", () => {
    state().add("c01", "M", 2);
    expect(selectDiscount(state())).toBe(0);
  });

  it("takes a percentage of the subtotal, rounded", () => {
    state().add("c01", "M", 2); // 830
    state().applyCoupon("NOIR20");
    expect(selectDiscount(state())).toBe(166);
  });

  it("takes a flat amount off", () => {
    state().add("c01", "M", 2);
    state().applyCoupon("FIRSTCUP");
    expect(selectDiscount(state())).toBe(150);
  });

  it("lapses if the cart later drops below the coupon minimum", () => {
    // The coupon stays attached but stops discounting, so removing items
    // cannot leave the order cheaper than its own rules allow.
    state().add("c01", "M", 2);
    state().applyCoupon("NOIR20");
    expect(selectDiscount(state())).toBe(166);

    state().setQty("c01__M", 1); // back down to 415
    expect(state().coupon?.code).toBe("NOIR20");
    expect(selectDiscount(state())).toBe(0);
  });

  it("never discounts more than the subtotal", () => {
    state().add("c01", "S", 1); // 340
    useCart.setState({
      coupon: { code: "BIG", kind: "flat", value: 5000, minSubtotal: 0, label: "test" },
    });
    expect(selectDiscount(state())).toBe(340);
  });
});

describe("selectDelivery", () => {
  it("is free for an empty cart", () => {
    expect(selectDelivery({ lines: [], coupon: null })).toBe(0);
  });

  it("charges the flat fee below the threshold", () => {
    state().add("c01", "M", 2); // 830
    expect(selectDelivery(state())).toBe(DELIVERY_FEE);
  });

  it("is free at or above the threshold", () => {
    state().add("c01", "L", 4); // 1972
    expect(selectSubtotal(state())).toBeGreaterThanOrEqual(FREE_DELIVERY_THRESHOLD);
    expect(selectDelivery(state())).toBe(0);
  });

  it("is judged after the discount, so a coupon can reinstate the fee", () => {
    // 1660 qualifies for free delivery; 20% off drops it to 1328 and the fee
    // comes back. Worth pinning either way — it surprises people.
    state().add("c01", "M", 4);
    expect(selectSubtotal(state())).toBe(1660);
    expect(selectDelivery(state())).toBe(0);

    state().applyCoupon("NOIR20");
    expect(selectDiscount(state())).toBe(332);
    expect(selectDelivery(state())).toBe(DELIVERY_FEE);
  });
});

describe("selectTax", () => {
  it("is 5% of the discounted subtotal", () => {
    state().add("c01", "M", 2); // 830
    expect(selectTax(state())).toBe(42);
  });

  it("is charged after the discount, not before", () => {
    state().add("c01", "M", 2);
    state().applyCoupon("NOIR20"); // 830 - 166 = 664
    expect(selectTax(state())).toBe(33);
  });
});

describe("selectTotal", () => {
  it("is zero for an empty cart, with no delivery fee attached", () => {
    expect(selectTotal({ lines: [], coupon: null })).toBe(0);
  });

  it("adds tax and delivery to the subtotal", () => {
    state().add("c01", "M", 2); // 830 + 42 tax + 49 delivery
    expect(selectTotal(state())).toBe(921);
  });

  it("subtracts the discount before tax and delivery", () => {
    state().add("c01", "M", 2);
    state().applyCoupon("NOIR20"); // 830 - 166 + 33 + 49
    expect(selectTotal(state())).toBe(746);
  });

  it("drops the delivery fee on a large enough order", () => {
    state().add("c01", "L", 4); // 1972 + 99 tax, no delivery
    expect(selectTotal(state())).toBe(2071);
  });

  it("agrees with its own parts", () => {
    state().add("c01", "M", 3);
    state().applyCoupon("GOLDCLUB");
    const s = state();
    expect(selectTotal(s)).toBe(
      selectSubtotal(s) - selectDiscount(s) + selectTax(s) + selectDelivery(s),
    );
  });
});

describe("selectEarnedPoints", () => {
  it("awards a tenth of the total, rounded", () => {
    state().add("c01", "M", 2); // total 921
    expect(selectEarnedPoints(state())).toBe(92);
  });

  it("awards nothing on an empty cart", () => {
    expect(selectEarnedPoints({ lines: [], coupon: null })).toBe(0);
  });

  it("is calculated on what was actually paid", () => {
    state().add("c01", "M", 2);
    const withoutCoupon = selectEarnedPoints(state());
    state().applyCoupon("NOIR20");
    expect(selectEarnedPoints(state())).toBeLessThan(withoutCoupon);
  });
});

describe("the coupon catalogue", () => {
  it("has no duplicate codes", () => {
    const codes = COUPONS.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("stores every code in upper case, since lookup uppercases the input", () => {
    for (const c of COUPONS) expect(c.code).toBe(c.code.toUpperCase());
  });

  it("names the two codes the error message suggests", () => {
    // The failure text tells customers to try NOIR20 or FIRSTCUP.
    expect(couponBy("NOIR20")).toBeTruthy();
    expect(couponBy("FIRSTCUP")).toBeTruthy();
  });
});
