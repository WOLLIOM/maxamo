import type { NextConfig } from "next";

/**
 * Two build modes:
 *  - default (Vercel): normal Next.js build, image optimization on.
 *  - STATIC_EXPORT=1: emits a plain static site into `out/`, for hosts that
 *    just serve files (Cloudflare Pages). The site has no API routes or
 *    server actions, so a static export is lossless apart from next/image
 *    optimization, which is disabled below.
 */
const isExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
