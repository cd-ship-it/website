import type { Sermon } from "../sermonApi";

function schemaTypes(type: unknown): string[] {
  if (typeof type === "string") return [type];
  if (Array.isArray(type)) return type.filter((t): t is string => typeof t === "string");
  return [];
}

function isVideoObject(node: Record<string, unknown>): boolean {
  return schemaTypes(node["@type"]).includes("VideoObject");
}

function uploadDateIso(date: string): string | undefined {
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) return undefined;
  return new Date(ms).toISOString().slice(0, 10);
}

function enrichVideoObjectNode(
  node: Record<string, unknown>,
  sermon: Pick<Sermon, "youtube_id" | "date" | "sermon_title">,
): Record<string, unknown> {
  if (!isVideoObject(node)) return { ...node };

  const { youtube_id, date, sermon_title } = sermon;
  const thumb = `https://i.ytimg.com/vi/${youtube_id}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${youtube_id}`;
  const contentUrl = `https://www.youtube.com/watch?v=${youtube_id}`;
  const upload = uploadDateIso(date);

  const existingName = node.name;
  const name =
    typeof existingName === "string" && existingName.trim()
      ? existingName.trim()
      : sermon_title;

  return {
    ...node,
    name,
    thumbnailUrl: node.thumbnailUrl ?? thumb,
    ...(upload ? { uploadDate: node.uploadDate ?? upload } : {}),
    embedUrl: node.embedUrl ?? embedUrl,
    contentUrl: node.contentUrl ?? contentUrl,
  };
}

function enrichValue(value: unknown, sermon: Pick<Sermon, "youtube_id" | "date" | "sermon_title">): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => enrichValue(v, sermon));

  const obj = value as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) {
    return {
      ...obj,
      "@graph": obj["@graph"].map((n) => enrichValue(n, sermon)),
    };
  }
  if (isVideoObject(obj)) {
    return enrichVideoObjectNode(obj, sermon);
  }
  return { ...obj };
}

/**
 * Fill required VideoObject fields from sermon + YouTube when AI JSON-LD omits them.
 */
export function enrichSermonVideoJsonLd(
  ld: unknown,
  sermon: Pick<Sermon, "youtube_id" | "date" | "sermon_title">,
): unknown {
  let parsed: unknown = ld;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return ld;
    }
  }
  return enrichValue(parsed, sermon);
}
