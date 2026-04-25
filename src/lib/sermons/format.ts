/** "Jan 5, 2025" — short form for cards and lists */
export function fmtDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "January 5, 2025" — long form for detail pages and campus cards */
export function formatDateLong(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function preacherLabel(chi: string, eng: string): string {
  return [chi, eng].filter(Boolean).join(" · ") || "—";
}

function tryParseSummaryJson(raw: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";

  // Support both plain JSON and fenced ```json ... ``` payloads.
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonSource = (fencedMatch?.[1] ?? trimmed).trim();
  if (!jsonSource.startsWith("{") || !jsonSource.endsWith("}")) return "";

  try {
    const parsed = JSON.parse(jsonSource) as {
      summary?: unknown;
      excerpt?: unknown;
      sections?: Array<{ summary?: unknown }>;
    };

    if (typeof parsed.excerpt === "string" && parsed.excerpt.trim()) {
      return parsed.excerpt.trim();
    }
    if (typeof parsed.summary === "string" && parsed.summary.trim()) {
      return parsed.summary.trim();
    }
    if (Array.isArray(parsed.sections)) {
      const firstSectionSummary = parsed.sections
        .map((section) => (typeof section?.summary === "string" ? section.summary.trim() : ""))
        .find(Boolean);
      if (firstSectionSummary) return firstSectionSummary;
    }
  } catch {
    // Non-JSON summary payloads should fall through to existing text cleanup.
  }

  return "";
}

export function summaryPreview(html: string, limit = 30): string {
  const parsedJsonSummary = tryParseSummaryJson(html);
  const text = (parsedJsonSummary || (html ?? "")).trim();
  if (!text) return "";
  const words = text.split(" ");
  return words.length > limit ? `${words.slice(0, limit).join(" ")}...` : text;
}

export function sermonThumb(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}
