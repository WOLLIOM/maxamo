import type { NextConfig } from "next";

/**
 * Single source of truth for build config (the old duplicate next.config.js
 * was removed). Two modes:
 *  - default (Vercel): normal Next.js build, image optimization on.
 *  - STATIC_EXPORT=1: emits a plain static site into `out/` for hosts that
 *    just serve files (Cloudflare Pages). No API routes / server actions, so
 *    the static export is lossless apart from next/image optimization, which
 *    is disabled below.
 */
const isExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Transpile the 3D ecosystem for maximum bundler compatibility.
  transpilePackages: ["three"],
  ...(isExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
