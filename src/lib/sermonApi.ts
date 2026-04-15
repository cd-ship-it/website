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
    const first = await fetchSermons({ per_page: 100, page: 1 });
    const results = [...first.data];
    for (let p = 2; p <= first.pagination.total_pages; p++) {
      const page = await fetchSermons({ per_page: 100, page: p });
      results.push(...page.data);
    }
    return results;
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
