import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

// Real photos to surface in Google Images, mapped to the page they appear on.
const imagesByPath: Record<string, { path: string; title: string; caption?: string }[]> = {
  "/": [
    {
      path: "/images/real/guitar-performance.webp",
      title: "Simon Maxam playing guitar live performance",
      caption: "Simon Maxam performing live on acoustic guitar.",
    },
    {
      path: "/images/real/solaris-earth-moon.webp",
      title: "SOLARIS — Earth and Moon in Unreal Engine 5",
    },
    {
      path: "/images/real/throne-portrait.webp",
      title: "Simon Maxam portrait",
    },
  ],
  "/gallery/": [
    {
      path: "/images/real/guitar-performance.webp",
      title: "Simon Maxam playing his red cherry acoustic guitar",
      caption: "Simon Maxam performing live on acoustic guitar.",
    },
  ],
};

/** XML sitemap for Search Console — matches trailingSlash routes. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/gallery/", "/contact/", "/about/"];
  const now = new Date();
  return paths.map((path) => {
    const images = imagesByPath[path];
    return {
      url: new URL(path, site.url).href,
      lastModified: now,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.8,
      ...(images
        ? {
            images: images.map((img) => new URL(img.path, site.url).href),
          }
        : {}),
    };
  });
}
