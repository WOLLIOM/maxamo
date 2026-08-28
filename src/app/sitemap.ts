import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

/** XML sitemap for Search Console — matches trailingSlash routes. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/gallery/", "/contact/", "/about/"];
  const now = new Date();
  return paths.map((path) => ({
    url: new URL(path, site.url).href,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
