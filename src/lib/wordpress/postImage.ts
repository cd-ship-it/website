import type { WpBasePost } from "./types";

export function firstImageSrcFromRenderedHtml(html: string): string {
  if (!html) return "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match?.[1]?.trim() ?? "";
}

function firstImageAltFromRenderedHtml(html: string): string {
  if (!html) return "";
  const match = html.match(/<img[^>]+alt=["']([^"']*)["'][^>]*>/i);
  return match?.[1]?.trim() ?? "";
}

function normalizeWpAssetUrl(url: string, wpOrigin: string): string {
  let out = url.trim();
  if (!out) return out;
  if (out.startsWith("//")) return `https:${out}`;
  if (out.startsWith("/")) return new URL(out, wpOrigin).toString();
  return out;
}

type WpRecordForImage = Pick<WpBasePost, "content" | "_embedded">;

export function wpPostFeaturedOrContentImageUrl(
  record: WpRecordForImage | null | undefined,
): string | undefined {
  if (!record) return undefined;
  const embedded = record._embedded?.["wp:featuredmedia"];
  const firstMedia = Array.isArray(embedded) ? embedded[0] : undefined;
  const fromFeatured =
    firstMedia &&
    typeof firstMedia === "object" &&
    "source_url" in firstMedia &&
    typeof (firstMedia as { source_url?: string }).source_url === "string"
      ? (firstMedia as { source_url: string }).source_url.trim()
      : "";
  if (fromFeatured) return fromFeatured;
  const fromContent = firstImageSrcFromRenderedHtml(record.content?.rendered ?? "");
  return fromContent || undefined;
}

export function wpPostFeaturedOrContentImageMeta(
  record: WpRecordForImage | null | undefined,
  fallbackAlt: string,
  wpOrigin?: string | null,
): { url: string; alt: string } | undefined {
  const rawUrl = wpPostFeaturedOrContentImageUrl(record);
  if (!rawUrl) return undefined;

  const embedded = record?._embedded?.["wp:featuredmedia"];
  const featured = Array.isArray(embedded) ? embedded[0] : undefined;
  let alt = fallbackAlt.trim() || "Article image";
  if (featured && typeof featured === "object" && "alt_text" in featured) {
    const t = (featured as { alt_text?: string }).alt_text?.trim();
    if (t) alt = t;
  } else {
    const fromContent = firstImageAltFromRenderedHtml(record?.content?.rendered ?? "");
    if (fromContent) alt = fromContent;
  }

  const url =
    wpOrigin && wpOrigin.trim()
      ? normalizeWpAssetUrl(rawUrl, wpOrigin.trim())
      : rawUrl;

  return { url, alt };
}
