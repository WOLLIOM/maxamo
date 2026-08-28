/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the site deploys effortlessly to Cloudflare Pages
  // (every `git push` builds `out/` and serves it from Cloudflare's edge CDN).
  output: "export",

  // Cloudflare Pages serves the exported HTML directly; enabling trailing
  // slashes keeps clean, canonical URLs like /menu/ consistent with routing.
  trailingSlash: true,

  reactStrictMode: true,

  images: {
    // next/image optimization requires a Node server; for a fully static
    // export we ship pre-optimised assets and let Cloudflare handle caching.
    unoptimized: true,
  },

  // Transpile the 3D ecosystem for maximum compatibility with the bundler.
  transpilePackages: ["three"],
};

export default nextConfig;
