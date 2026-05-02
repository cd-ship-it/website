import { getWordPressUrl } from "../config/site";

export interface HeartOfShepherdPost {
  id: number;
  slug: string;
  routeSlug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  link: string;
}

interface CacheShape {
  fetchedAt: string;
  posts: HeartOfShepherdPost[];
}

const HEART_CATEGORY_ID = 278;
const HEART_CACHE_FILE = "cache/heart-of-a-shepherd-posts.json";
const WP_PER_PAGE = 100;

function isTruthyEnvValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function shouldBypassHeartCache(): boolean {
  const envValue =
    import.meta.env.HEART_SHEPHERD_CACHE_BYPASS ??
    process.env.HEART_SHEPHERD_CACHE_BYPASS;
  return isTruthyEnvValue(envValue);
}

function stripHtml(input: string): string {
  return (input ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function toRouteSlug(input: string, fallback: string): string {
  const normalized = (input || "")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function ensureUniqueRouteSlugs(posts: HeartOfShepherdPost[]): HeartOfShepherdPost[] {
  const seen = new Map<string, number>();
  return posts.map((post) => {
    const fallback = `post-${post.id}`;
    const base = toRouteSlug((post.slug || "").trim(), fallback);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return {
      ...post,
      routeSlug: count === 0 ? base : `${base}-${count + 1}`,
    };
  });
}

function dedupeById(posts: HeartOfShepherdPost[]): HeartOfShepherdPost[] {
  const map = new Map<number, HeartOfShepherdPost>();
  for (const post of posts) {
    if (!map.has(post.id)) map.set(post.id, post);
  }
  return [...map.values()];
}

async function readHeartCache(): Promise<HeartOfShepherdPost[]> {
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(HEART_CACHE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as CacheShape;
    if (!parsed || !Array.isArray(parsed.posts)) return [];
    return parsed.posts.filter((post) => typeof post?.id === "number");
  } catch {
    return [];
  }
}

async function writeHeartCache(posts: HeartOfShepherdPost[]): Promise<void> {
  try {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    await mkdir(dirname(HEART_CACHE_FILE), { recursive: true });
    const payload: CacheShape = {
      fetchedAt: new Date().toISOString(),
      posts,
    };
    await writeFile(HEART_CACHE_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (e) {
    console.warn("[heart-of-shepherd] Could not write archive cache:", e);
  }
}

async function fetchWpPage(baseUrl: string, page: number): Promise<{
  posts: HeartOfShepherdPost[];
  totalPages: number;
}> {
  const url = new URL("/wp-json/wp/v2/posts", baseUrl);
  url.searchParams.set("categories", String(HEART_CATEGORY_ID));
  url.searchParams.set("per_page", String(WP_PER_PAGE));
  url.searchParams.set("page", String(page));
  url.searchParams.set("_embed", "1");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`WP posts API error: ${res.status}`);
  }

  const rawPosts = (await res.json()) as Array<Record<string, unknown>>;
  const totalPages = Number.parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10) || 1;
  const posts: HeartOfShepherdPost[] = rawPosts.map((post) => {
    const title = stripHtml(String((post.title as { rendered?: string })?.rendered ?? ""));
    const excerpt = stripHtml(String((post.excerpt as { rendered?: string })?.rendered ?? ""));
    const content = String((post.content as { rendered?: string })?.rendered ?? "");
    return {
      id: Number(post.id),
      slug: String(post.slug ?? ""),
      routeSlug: String(post.slug ?? ""),
      title,
      excerpt,
      content,
      date: String(post.date ?? ""),
      link: String(post.link ?? ""),
    };
  });

  return { posts, totalPages };
}

export async function fetchAllHeartOfShepherdPosts(): Promise<HeartOfShepherdPost[]> {
  const baseUrl = getWordPressUrl();
  if (!baseUrl) return [];

  try {
    const bypassCache = shouldBypassHeartCache();
    const cached = bypassCache ? [] : await readHeartCache();
    const cachedIds = new Set(cached.map((post) => post.id));
    const fetchedNow: HeartOfShepherdPost[] = [];

    let page = 1;
    let totalPages = 1;
    let foundOverlap = false;

    do {
      const { posts, totalPages: fetchedTotalPages } = await fetchWpPage(baseUrl, page);
      totalPages = fetchedTotalPages;
      fetchedNow.push(...posts);

      if (cached.length > 0 && posts.some((post) => cachedIds.has(post.id))) {
        foundOverlap = true;
        break;
      }
      page += 1;
    } while (page <= totalPages);

    let merged = dedupeById([...fetchedNow, ...cached]);
    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    merged = ensureUniqueRouteSlugs(merged);

    if (!bypassCache) {
      await writeHeartCache(merged);
    }

    if (bypassCache) {
      console.info("[heart-of-shepherd] HEART_SHEPHERD_CACHE_BYPASS enabled; refreshed archive.");
    } else if (foundOverlap) {
      console.info("[heart-of-shepherd] Reused cached older archive posts.");
    }

    return merged;
  } catch (e) {
    console.warn("[heart-of-shepherd] Could not fetch archive posts:", e);
    return [];
  }
}
