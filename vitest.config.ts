import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Unit tests for the pure layer — `lib/`.
 *
 * That is where the money lives: cart totals, discounts, delivery thresholds
 * and the price formatting the customer actually reads.
 *
 * The environment is jsdom rather than node because the cart store is wrapped
 * in zustand's `persist`, which resolves localStorage when the module is first
 * evaluated. A shim installed from setupFiles lands too late — the store is
 * already built by then — so the store fell back to no storage and warned on
 * every write. jsdom has it before any import runs.
 *
 * The components are deliberately out of scope. They are covered end to end by
 * the export checks and live smoke test already in the deploy workflow.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    include: ["lib/**/*.test.ts"],
  },
});
