/**
 * Build-time fetch of WordPress REST data for Open Graph / Twitter preview tags (static HTML).
 */

import { wpPostFeaturedOrContentImageMeta } from "./wordpress/postImage";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trim()}…`;
}

export type WpLinkPreviewResult = {
  title: string;
  description: string;
  image: { url: string; alt: string };
};

type WpPostWithEmbed = {
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  _embedded?: {
    "wp:featuredmedia"?: { source_url?: string; alt_text?: string }[];
  };
};

/**
 * Fetches the latest post in a category with `_embed` for the featured image.
 * Returns `null` on failure so callers can fall back to static defaults.
 */
export async function fetchCategoryLatestPostLinkPreview(
  wpBaseUrl: string,
  categorySlug: string,
  fallback: WpLinkPreviewResult,
): Promise<WpLinkPreviewResult | null> {
  const apiRoot = new URL("/wp-json/wp/v2/", wpBaseUrl).toString();

  const catUrl = new URL("categories", apiRoot);
  catUrl.searchParams.set("slug", categorySlug);
  catUrl.searchParams.set("per_page", "1");

  const catRes = await fetch(catUrl.toString());
  if (!catRes.ok) return null;
  const categories = (await catRes.json()) as { id: number }[];
  const categoryId = categories[0]?.id;
  if (!categoryId) return null;

  const postsUrl = new URL("posts", apiRoot);
  postsUrl.searchParams.set("categories", String(categoryId));
  postsUrl.searchParams.set("per_page", "1");
  postsUrl.searchParams.set("orderby", "date");
  postsUrl.searchParams.set("order", "desc");
  postsUrl.searchParams.set("status", "publish");
  postsUrl.searchParams.set("_embed", "1");

  const postsRes = await fetch(postsUrl.toString());
  if (!postsRes.ok) return null;
  const posts = (await postsRes.json()) as WpPostWithEmbed[];
  const post = posts[0];
  if (!post) return null;

  const rawTitle = stripHtml(post.title?.rendered ?? "");
  const title = rawTitle
    ? `${rawTitle} · Heart of a Shepherd · Crosspoint Church`
    : fallback.title;

  let desc = stripHtml(post.excerpt?.rendered ?? "");
  if (!desc) {
    desc = stripHtml(post.content?.rendered ?? "");
  }
  desc = truncate(desc, 160) || fallback.description;

  const og = wpPostFeaturedOrContentImageMeta(
    post,
    rawTitle || fallback.image.alt,
    wpBaseUrl,
  );

  if (!og) {
    return { title, description: desc, image: fallback.image };
  }

  return {
    title,
    description: desc,
    image: og,
  };
}
