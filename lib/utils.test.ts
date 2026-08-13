import { describe, expect, it } from "vitest";

import { formatPrice, formatPriceExact, groupIndian } from "@/lib/utils";

describe("formatPriceExact", () => {
  it("renders whole rupees with two decimal places", () => {
    expect(formatPriceExact(340)).toBe("₹340.00");
  });

  it("keeps paise that do not need rounding", () => {
    expect(formatPriceExact(1234.5)).toBe("₹1,234.50");
    expect(formatPriceExact(99.25)).toBe("₹99.25");
  });

  it("rounds paise to the nearest whole paisa", () => {
    expect(formatPriceExact(1234.567)).toBe("₹1,234.57");
  });

  it("carries into rupees when the paise round up to 100", () => {
    // Flooring the rupees before rounding the remainder printed a third digit
    // after the point: 1.999 came out as ₹1.100.
    expect(formatPriceExact(1.999)).toBe("₹2.00");
    expect(formatPriceExact(0.999)).toBe("₹1.00");
    expect(formatPriceExact(99.995)).toBe("₹100.00");
  });

  it("never emits more than two digits after the point", () => {
    for (const value of [0.999, 1.999, 9.999, 99.995, 12.9951, 1234.9999]) {
      expect(formatPriceExact(value)).toMatch(/^-?₹[\d,]+\.\d{2}$/);
    }
  });

  it("carries a negative value the same way", () => {
    expect(formatPriceExact(-0.999)).toBe("-₹1.00");
    expect(formatPriceExact(-12.5)).toBe("-₹12.50");
  });

  it("groups the rupee part in the Indian system", () => {
    expect(formatPriceExact(123456.78)).toBe("₹1,23,456.78");
  });

  it("handles zero", () => {
    expect(formatPriceExact(0)).toBe("₹0.00");
  });
});

describe("groupIndian", () => {
  it("leaves three digits or fewer alone", () => {
    expect(groupIndian(0)).toBe("0");
    expect(groupIndian(999)).toBe("999");
  });

  it("groups the last three digits, then in pairs", () => {
    expect(groupIndian(1000)).toBe("1,000");
    expect(groupIndian(100000)).toBe("1,00,000");
    expect(groupIndian(12345678)).toBe("1,23,45,678");
  });

  it("keeps the sign outside the digits", () => {
    expect(groupIndian(-100000)).toBe("-1,00,000");
  });

  it("rounds to whole rupees", () => {
    expect(groupIndian(999.6)).toBe("1,000");
  });
});

describe("formatPrice", () => {
  it("prefixes the rupee symbol", () => {
    expect(formatPrice(340)).toBe("₹340");
    expect(formatPrice(123456)).toBe("₹1,23,456");
  });
});
