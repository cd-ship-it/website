import { getApiOrigin, getEventsApiUrl as eventsApiUrlFromConfig } from "../config/site";

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  startDate: string;
  endDate?: string;
  time?: string;
  location?: string;
  image?: string;
  registrationLink?: string;
}

export interface EventListResponse {
  data: EventItem[];
}

type UnknownRecord = Record<string, unknown>;

function asRecord(v: unknown): UnknownRecord {
  return (v && typeof v === "object" ? v : {}) as UnknownRecord;
}

function asString(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "";
}

function pickString(obj: UnknownRecord, keys: string[]): string {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

function renderedField(val: unknown): string {
  if (typeof val === "string") return val;
  const rec = asRecord(val);
  return asString(rec.rendered);
}

function normalizeDateInput(input: string): string {
  if (!input) return "";
  const dateOnly = input.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnly) return dateOnly[1];
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function compactSlug(input: string): string {
  return (input ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeEvent(raw: unknown): EventItem {
  const rec = asRecord(raw);
  const acf = asRecord(rec.acf);
  const meta = asRecord(rec.meta);
  const venue = asRecord(rec.venue);
  const embedded = asRecord(rec._embedded);
  const mediaList = (embedded["wp:featuredmedia"] as unknown[]) ?? [];
  const firstMedia = asRecord(mediaList[0]);
  const imageObj = asRecord(rec.image);

  const id =
    pickString(rec, ["id", "event_id", "eventId"]) ||
    pickString(acf, ["id", "event_id"]) ||
    "";

  const title =
    renderedField(rec.title) ||
    pickString(rec, ["event_title", "name", "title"]) ||
    pickString(acf, ["event_title", "name", "title"]) ||
    "Untitled Event";

  const content =
    renderedField(rec.content) ||
    pickString(rec, ["description", "body", "event_description"]) ||
    pickString(acf, ["description", "body", "event_description"]) ||
    "";

  const startDate =
    normalizeDateInput(
      pickString(rec, ["start_date", "startDate", "event_start_date", "date"]),
    ) ||
    normalizeDateInput(
      pickString(acf, ["start_date", "startDate", "event_start_date", "date"]),
    ) ||
    normalizeDateInput(
      pickString(meta, ["start_date", "startDate", "event_start_date", "date"]),
    );

  const endDate =
    normalizeDateInput(
      pickString(rec, ["end_date", "endDate", "event_end_date"]),
    ) ||
    normalizeDateInput(
      pickString(acf, ["end_date", "endDate", "event_end_date"]),
    ) ||
    normalizeDateInput(
      pickString(meta, ["end_date", "endDate", "event_end_date"]),
    ) ||
    undefined;

  const time =
    pickString(rec, ["time", "event_time", "start_time"]) ||
    pickString(acf, ["time", "event_time", "start_time"]) ||
    pickString(meta, ["time", "event_time", "start_time"]) ||
    undefined;

  const location =
    pickString(rec, ["location", "venue_name"]) ||
    pickString(acf, ["location", "venue_name"]) ||
    pickString(venue, ["name", "title"]) ||
    undefined;

  const image =
    pickString(imageObj, ["url", "src", "source_url"]) ||
    pickString(firstMedia, ["source_url"]) ||
    pickString(rec, ["featured_image", "image"]) ||
    pickString(acf, ["featured_image", "image"]) ||
    undefined;

  const registrationLink =
    pickString(rec, ["registration_link", "registrationLink"]) ||
    pickString(acf, ["registration_link", "registrationLink"]) ||
    undefined;

  const safeSlug = compactSlug(title);

  return {
    id: id || safeSlug || "event",
    slug: safeSlug || "event",
    title,
    summary: "",
    content,
    startDate,
    endDate,
    time,
    location,
    image,
    registrationLink,
  };
}

export function getEventsApiUrl(): string {
  return eventsApiUrlFromConfig();
}

function buildEventsApiUrl(
  params: Record<string, string | number> = {},
): string {
  const apiUrl = getEventsApiUrl();
  const base = getApiOrigin();
  const url = new URL(apiUrl, base);
  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.set(k, String(v)),
  );
  return url.toString();
}

export async function fetchEvents(
  params: Record<string, string | number> = {},
): Promise<EventListResponse> {
  const res = await fetch(buildEventsApiUrl(params));
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();

  const root = asRecord(json);
  const arr =
    (Array.isArray(json) ? json : null) ??
    (Array.isArray(root.data) ? root.data : null) ??
    (Array.isArray(root.events) ? root.events : null) ??
    [];

  return { data: arr.map(normalizeEvent).filter((e) => !!e.startDate && !!e.slug) };
}

export async function fetchAllEvents(): Promise<EventItem[]> {
  const first = await fetchEvents({ page: 1, per_page: 100 });
  return first.data;
}
