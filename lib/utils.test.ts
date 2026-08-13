import { describe, expect, it } from "vitest";

import {
  clamp,
  cn,
  formatCompact,
  formatPrice,
  formatPriceExact,
  gradientFor,
  groupIndian,
  hash01,
  lerp,
  slugify,
  splitWords,
} from "@/lib/utils";

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


describe("formatCompact", () => {
  it("leaves values under a thousand as whole numbers", () => {
    expect(formatCompact(0)).toBe("0");
    expect(formatCompact(999)).toBe("999");
  });

  it("scales into thousands, lakh and crore", () => {
    expect(formatCompact(1_500)).toBe("1.5K");
    expect(formatCompact(2_50_000)).toBe("2.5L");
    expect(formatCompact(3_50_00_000)).toBe("3.5Cr");
  });

  it("switches unit exactly at each boundary", () => {
    expect(formatCompact(999)).toBe("999");
    expect(formatCompact(1_000)).toBe("1.0K");
    expect(formatCompact(99_999)).toBe("100.0K");
    expect(formatCompact(1_00_000)).toBe("1.0L");
  });

  it("keeps the sign outside the magnitude", () => {
    expect(formatCompact(-1_500)).toBe("-1.5K");
    expect(formatCompact(-250)).toBe("-250");
  });
});

describe("clamp", () => {
  it("returns the value when it already sits in range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("pins to each bound", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it("includes the bounds themselves", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe("lerp", () => {
  it("returns each end at t=0 and t=1", () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it("interpolates in between", () => {
    expect(lerp(0, 100, 0.25)).toBe(25);
  });

  it("extrapolates past the ends rather than clamping", () => {
    // Callers clamp when they need to; lerp itself does not.
    expect(lerp(0, 100, 1.5)).toBe(150);
  });
});

describe("hash01", () => {
  it("is deterministic for the same input", () => {
    expect(hash01("midnight-velvet-latte")).toBe(hash01("midnight-velvet-latte"));
  });

  it("stays within 0 and 1", () => {
    for (const seed of ["a", "coffee", "c01", "", "a much longer seed string"]) {
      const value = hash01(seed);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("separates similar seeds", () => {
    // Adjacent menu ids must not land on visually identical output.
    expect(hash01("c01")).not.toBe(hash01("c02"));
  });
});

describe("gradientFor", () => {
  it("is stable for a seed", () => {
    expect(gradientFor("c01")).toEqual(gradientFor("c01"));
  });

  it("returns two hsl stops", () => {
    const [from, to] = gradientFor("c01");
    expect(from).toMatch(/^hsl\(/);
    expect(to).toMatch(/^hsl\(/);
  });

  it("stays inside the coffee hue band", () => {
    // The palette depends on every fallback sitting in the amber range.
    for (const seed of ["c01", "c02", "p07", "d03", "anything"]) {
      const hue = Number(gradientFor(seed)[0].match(/hsl\((\d+(?:\.\d+)?)/)![1]);
      expect(hue).toBeGreaterThanOrEqual(18);
      expect(hue).toBeLessThanOrEqual(52);
    }
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Midnight Velvet Latte")).toBe("midnight-velvet-latte");
  });

  it("collapses runs of punctuation into one hyphen", () => {
    expect(slugify("Gold Leaf  --  Cappuccino!")).toBe("gold-leaf-cappuccino");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  !Espresso!  ")).toBe("espresso");
  });
});

describe("splitWords", () => {
  it("splits into words and characters", () => {
    expect(splitWords("Every Cup")).toEqual([
      { word: "Every", chars: ["E", "v", "e", "r", "y"] },
      { word: "Cup", chars: ["C", "u", "p"] },
    ]);
  });

  it("preserves every character across the split", () => {
    const text = "Noir Cafe";
    const rejoined = splitWords(text).map((w) => w.chars.join("")).join(" ");
    expect(rejoined).toBe(text);
  });
});

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("lets a later tailwind class win over an earlier conflicting one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
