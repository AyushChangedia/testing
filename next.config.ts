import type { NextConfig } from "next";

/*
 * Set by the GitHub Pages workflow. Pages serves the site from a repo
 * subdirectory (/<repo>), so every internal link and asset URL needs that
 * prefix; locally it stays empty and nothing changes.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* Static export for Pages — no Node server, so no image optimiser either. */
const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const, trailingSlash: true } : {}),
  basePath,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
    /*
     * A static export has no server to run the optimiser, so images are served
     * straight from Unsplash's CDN at the exact width and quality requested in
     * the data files. Full original quality — nothing is re-encoded or resized.
     */
    unoptimized: isStaticExport,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
};

export default nextConfig;
