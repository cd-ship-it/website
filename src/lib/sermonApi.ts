export interface Sermon {
  youtube_id: string;
  date: string;
  sermon_title: string;
  preacher_chi: string;
  preacher_eng: string;
  location: string;
  language: string;
  summary: string;
}

export interface SermonListResponse {
  data: Sermon[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

const TWO_WEEKS_IN_MS = 14 * 24 * 60 * 60 * 1000;
const SERMON_ARCHIVE_CACHE_FILE = ".cache/sermons-archive.json";

function isTruthyEnvValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function shouldBypassSermonArchiveCache(): boolean {
  return isTruthyEnvValue(import.meta.env.SERMON_CACHE_BYPASS);
}

function isOlderThanTwoWeeks(dateInput: string): boolean {
  const timestamp = Date.parse(dateInput);
  if (Number.isNaN(timestamp)) return false;
  return timestamp < Date.now() - TWO_WEEKS_IN_MS;
}

function dedupeSermonsByYoutubeId(sermons: Sermon[]): Sermon[] {
  const map = new Map<string, Sermon>();
  for (const sermon of sermons) {
    if (!sermon?.youtube_id) continue;
    if (!map.has(sermon.youtube_id)) map.set(sermon.youtube_id, sermon);
  }
  return [...map.values()];
}

async function readOlderSermonsCache(): Promise<Sermon[]> {
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(SERMON_ARCHIVE_CACHE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Sermon => !!item && typeof item.youtube_id === "string");
  } catch {
    return [];
  }
}

async function writeOlderSermonsCache(sermons: Sermon[]): Promise<void> {
  try {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    await mkdir(dirname(SERMON_ARCHIVE_CACHE_FILE), { recursive: true });
    await writeFile(SERMON_ARCHIVE_CACHE_FILE, JSON.stringify(sermons, null, 2), "utf-8");
  } catch (e) {
    console.warn("[sermonApi] Could not write sermon archive cache:", e);
  }
}

export function getApiUrl(): string {
  return import.meta.env.PUBLIC_SERMON_API_URL ?? '';
}

export async function fetchSermons(
  params: Record<string, string | number> = {}
): Promise<SermonListResponse> {
  const raw = getApiUrl();
  if (!raw || !raw.startsWith("http")) {
    return { data: [], pagination: { page: 1, per_page: 0, total: 0, total_pages: 0 } };
  }
  const url = new URL(raw);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/** Fetches every sermon (used in getStaticPaths at build time). */
export async function fetchAllSermons(): Promise<Sermon[]> {
  try {
    const bypassCache = shouldBypassSermonArchiveCache();
    const cachedOlderSermons = bypassCache ? [] : await readOlderSermonsCache();
    const recentSermons: Sermon[] = [];
    const olderFetchedThisBuild: Sermon[] = [];
    let stoppedAfterArchiveBoundary = false;

    const first = await fetchSermons({ per_page: 100, page: 1 });
    const pages = [first];
    for (let p = 2; p <= first.pagination.total_pages; p++) {
      const page = await fetchSermons({ per_page: 100, page: p });
      pages.push(page);

      if (!bypassCache && page.data.length > 0 && page.data.every((sermon) => isOlderThanTwoWeeks(sermon.date))) {
        stoppedAfterArchiveBoundary = true;
        break;
      }
    }

    for (const page of pages) {
      for (const sermon of page.data) {
        if (isOlderThanTwoWeeks(sermon.date)) {
          olderFetchedThisBuild.push(sermon);
        } else {
          recentSermons.push(sermon);
        }
      }
    }

    const mergedOlderSermons = stoppedAfterArchiveBoundary && !bypassCache
      ? dedupeSermonsByYoutubeId([...olderFetchedThisBuild, ...cachedOlderSermons])
      : dedupeSermonsByYoutubeId(olderFetchedThisBuild);

    await writeOlderSermonsCache(mergedOlderSermons);

    const combined = dedupeSermonsByYoutubeId([...recentSermons, ...mergedOlderSermons]);

    if (stoppedAfterArchiveBoundary && !bypassCache) {
      console.info("[sermonApi] Using cached archive sermons older than 14 days.");
    }
    if (bypassCache) {
      console.info("[sermonApi] SERMON_CACHE_BYPASS enabled; refreshed all sermons.");
    }

    return combined;
  } catch (e) {
    console.warn("[sermonApi] Could not fetch sermons at build time:", e);
    return [];
  }
}

export async function fetchSermon(id: string): Promise<Sermon | null> {
  const url = `${getApiUrl()}?id=${encodeURIComponent(id)}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
