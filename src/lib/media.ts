/** Build responsive image paths (JPEG/PNG + optional WebP sibling). */
export function imageSources(src: string) {
  const webp = src.replace(/\.(jpe?g|png)$/i, ".webp");
  return { fallback: src, webp };
}
