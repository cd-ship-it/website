import type { LocalizedText } from "./i18n";
import { getWpMediaById, getWpPostsByCategoryId } from "./wordpress";
import type { WpPost } from "./wordpress/types";

/** Bio category on WordPress (slug `bio`). */
const BIO_CATEGORY_ID = 355;

const PASTORS_CACHE_FILE = "cache/pastors.json";

function isTruthyEnvValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function shouldBypassPastorsCache(): boolean {
  const envValue =
    import.meta.env.PASTORS_CACHE_BYPASS ?? process.env.PASTORS_CACHE_BYPASS;
  return isTruthyEnvValue(envValue);
}

export type Pastor = {
  id: number;
  slug: string;
  /** Last path segment of WordPress `link` (e.g. `gideonlee` from …/gideonlee/). */
  anchorId: string;
  order: number;
  name: LocalizedText;
  title: LocalizedText;
  bio: LocalizedText;
  /** Absolute URL from WordPress media, or site-relative path for placeholder. */
  image: string;
  email?: string;
};

/** Last non-empty path segment of the canonical WP URL; used for `#anchor` on /about-pastors. */
export function anchorIdFromWpLink(link: string | undefined, fallbackSlug: string): string {
  let fromLink = "";
  if (link && typeof link === "string") {
    try {
      const u = new URL(link.trim());
      const parts = u.pathname.split("/").filter(Boolean);
      fromLink = decodeURIComponent(parts[parts.length - 1] ?? "");
    } catch {
      fromLink = "";
    }
  }
  const raw = (fromLink || fallbackSlug || "").trim();
  if (raw) return raw;
  return "";
}

type WpAcfPastor = {
  name_en?: string;
  name_zhant?: string;
  name_zhans?: string;
  /** Legacy field name before `_zhant` migration. */
  name_zh?: string;
  title_en?: string;
  title_zhant?: string;
  title_zhans?: string;
  title_zh?: string;
  bio_en?: string;
  bio_zhant?: string;
  bio_zhans?: string;
  bio_zh?: string;
  photo?: number | string;
  email?: string;
  order?: number | string;
};

function trimOrEmpty(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

function normalizeBioText(raw: string): string {
  return raw.replace(/\r\n/g, "\n").trim();
}

function pickPhotoUrlFromMedia(media: {
  source_url: string;
  media_details?: { sizes?: Record<string, { source_url?: string } | undefined> };
}): string {
  const sizes = media.media_details?.sizes;
  const mediumLarge = sizes?.medium_large?.source_url;
  const medium = sizes?.medium?.source_url;
  return mediumLarge || medium || media.source_url || "";
}

function featuredImageFromPost(post: WpPost): string {
  const embedded = post._embedded?.["wp:featuredmedia"]?.[0];
  if (embedded && typeof embedded.source_url === "string" && embedded.source_url.trim()) {
    return embedded.source_url.trim();
  }
  return "";
}

function buildLocalized(
  en: string,
  zhant: string,
  zhans: string,
  legacyZh: string,
  titleFallback: string,
): LocalizedText {
  const enOut = normalizeBioText(en || titleFallback);
  const zhantOut = normalizeBioText(zhant || legacyZh) || enOut;
  const zhansOut = normalizeBioText(zhans || zhant || legacyZh) || enOut;
  return {
    en: enOut,
    "zh-Hant": zhantOut,
    "zh-Hans": zhansOut,
  };
}

function parseAcf(post: WpPost): WpAcfPastor {
  const acf = post.acf;
  if (acf && typeof acf === "object" && !Array.isArray(acf)) {
    return acf as WpAcfPastor;
  }
  return {};
}

function acfOrder(acf: WpAcfPastor): number {
  const o = acf.order;
  if (typeof o === "number" && Number.isFinite(o)) return o;
  if (typeof o === "string" && o.trim() !== "") {
    const n = Number(o);
    if (Number.isFinite(n)) return n;
  }
  return Number.POSITIVE_INFINITY;
}

function parsePhotoId(acf: WpAcfPastor): number {
  const p = acf.photo;
  if (typeof p === "number" && p > 0) return p;
  if (typeof p === "string" && /^\d+$/.test(p.trim())) return Number(p.trim());
  return 0;
}

const PLACEHOLDER_IMAGE = "/uploads/page-header-bg.webp";

async function readPastorsCache(): Promise<Pastor[]> {
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(PASTORS_CACHE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    type Cached = Omit<Pastor, "anchorId"> & { anchorId?: string };

    const rows = parsed.filter((row): row is Cached => {
      if (!row || typeof row !== "object") return false;
      const p = row as Cached;
      return (
        typeof p.id === "number" &&
        typeof p.slug === "string" &&
        typeof p.image === "string" &&
        p.name != null &&
        p.title != null &&
        p.bio != null
      );
    });

    return rows.map(
      (p): Pastor => ({
        ...p,
        order:
          typeof p.order === "number" && Number.isFinite(p.order)
            ? p.order
            : Number.POSITIVE_INFINITY,
        anchorId:
          (typeof p.anchorId === "string" && p.anchorId.trim()
            ? p.anchorId.trim()
            : p.slug.trim()) || `pastor-${p.id}`,
      }),
    );
  } catch {
    return [];
  }
}

async function writePastorsCache(pastors: Pastor[]): Promise<void> {
  try {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    await mkdir(dirname(PASTORS_CACHE_FILE), { recursive: true });
    await writeFile(PASTORS_CACHE_FILE, JSON.stringify(pastors, null, 2), "utf-8");
  } catch (e) {
    console.warn("[pastorsApi] Could not write pastors cache:", e);
  }
}

/**
 * Fetches pastor bios from WordPress (category 355), resolves photos, sorts by `acf.order`.
 * Caches to `cache/pastors.json` on success; on failure returns cache if present.
 */
export async function fetchPastors(): Promise<Pastor[]> {
  const bypass = shouldBypassPastorsCache();

  try {
    const posts = await getWpPostsByCategoryId(BIO_CATEGORY_ID);
    const photoIds = new Set<number>();
    const rows: { post: WpPost; acf: WpAcfPastor; photoId: number }[] = [];

    for (const post of posts) {
      const acf = parseAcf(post);
      const photoId = parsePhotoId(acf);
      if (photoId > 0) photoIds.add(photoId);
      rows.push({ post, acf, photoId });
    }

    const mediaUrlById = new Map<number, string>();
    await Promise.all(
      [...photoIds].map(async (id) => {
        const media = await getWpMediaById(id);
        const url = media ? pickPhotoUrlFromMedia(media) : "";
        if (url) mediaUrlById.set(id, url);
      }),
    );

    const pastors: Pastor[] = rows.map(({ post, acf, photoId }) => {
      const titleRendered = post.title?.rendered?.replace(/<[^>]+>/g, "")?.trim() ?? "";

      const name = buildLocalized(
        trimOrEmpty(acf.name_en),
        trimOrEmpty(acf.name_zhant),
        trimOrEmpty(acf.name_zhans),
        trimOrEmpty(acf.name_zh),
        titleRendered || "Pastor",
      );

      const title = buildLocalized(
        trimOrEmpty(acf.title_en),
        trimOrEmpty(acf.title_zhant),
        trimOrEmpty(acf.title_zhans),
        trimOrEmpty(acf.title_zh),
        titleRendered || name.en,
      );

      const bio = buildLocalized(
        trimOrEmpty(acf.bio_en),
        trimOrEmpty(acf.bio_zhant),
        trimOrEmpty(acf.bio_zhans),
        trimOrEmpty(acf.bio_zh),
        "",
      );

      let image = photoId > 0 ? mediaUrlById.get(photoId) ?? "" : "";
      if (!image) image = featuredImageFromPost(post);
      if (!image) image = PLACEHOLDER_IMAGE;

      const emailRaw = trimOrEmpty(acf.email);
      const email = emailRaw || undefined;

      const anchorId =
        anchorIdFromWpLink(post.link, post.slug).trim() ||
        post.slug.trim() ||
        `pastor-${post.id}`;

      return {
        id: post.id,
        slug: post.slug,
        anchorId,
        order: acfOrder(acf),
        name,
        title,
        bio,
        image,
        email,
      };
    });

    pastors.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.id - b.id;
    });

    if (!bypass) {
      await writePastorsCache(pastors);
    } else {
      console.info("[pastorsApi] PASTORS_CACHE_BYPASS enabled; skipped writing pastors cache.");
    }

    return pastors;
  } catch (e) {
    console.warn("[pastorsApi] Could not fetch pastors from WordPress:", e);
    const cached = await readPastorsCache();
    if (cached.length > 0) {
      console.info("[pastorsApi] Using cached pastors.");
      return cached;
    }
    return [];
  }
}
