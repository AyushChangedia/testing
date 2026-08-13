import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Unit tests for the pure layer — `lib/`.
 *
 * That is where the money lives: cart totals, discounts, delivery thresholds
 * and the price formatting the customer actually reads. None of it needs a DOM,
 * so the suite runs in plain node and stays fast enough to gate a deploy.
 *
 * The components are deliberately out of scope. They are covered end-to-end by
 * the export checks and live smoke test already in the deploy workflow.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
