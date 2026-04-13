export type SiteLang = "en" | "zh-Hant" | "zh-Hans";

export const SITE_LANGS: SiteLang[] = ["en", "zh-Hant", "zh-Hans"];

export interface LocaleStrings {
  nav: {
    home: string;
    about: string;
    aboutUs: string;
    staff: string;
    ministries: string;
    sermons: string;
    events: string;
    imNew: string;
    contact: string;
    giving: string;
    language: string;
    viewOnGithub: string;
  };
}

export const LANG_LABELS: Record<SiteLang, string> = {
  en: "English",
  "zh-Hant": "繁體",
  "zh-Hans": "简体",
};

export const I18N: Record<SiteLang, LocaleStrings> = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      aboutUs: "About Us",
      staff: "Staff",
      ministries: "Ministries",
      sermons: "Sermons",
      events: "Events",
      imNew: "I'm New",
      contact: "Contact",
      giving: "Giving",
      language: "Language",
      viewOnGithub: "View on GitHub",
    },
  },
  "zh-Hant": {
    nav: {
      home: "首頁",
      about: "關於",
      aboutUs: "關於我們",
      staff: "同工團隊",
      ministries: "事工",
      sermons: "講道",
      events: "活動",
      imNew: "新朋友",
      contact: "聯絡",
      giving: "奉獻",
      language: "語言",
      viewOnGithub: "前往 GitHub",
    },
  },
  "zh-Hans": {
    nav: {
      home: "首页",
      about: "关于",
      aboutUs: "关于我们",
      staff: "同工团队",
      ministries: "事工",
      sermons: "讲道",
      events: "活动",
      imNew: "新朋友",
      contact: "联络",
      giving: "奉献",
      language: "语言",
      viewOnGithub: "前往 GitHub",
    },
  },
};

export function normalizeSiteLang(input?: string): SiteLang {
  return SITE_LANGS.includes(input as SiteLang) ? (input as SiteLang) : "en";
}

export function getLocale(lang?: string): LocaleStrings {
  return I18N[normalizeSiteLang(lang)];
}

/** Single-file trilingual string (e.g. content collections). */
export type LocalizedText = {
  en: string;
  "zh-Hant"?: string;
  "zh-Hans"?: string;
};

function nonEmptyLocalized(s: string | undefined): s is string {
  return s != null && String(s).trim() !== "";
}

/**
 * Resolves text for one language slot from trilingual content (or a plain string).
 *
 * Fallbacks (empty or whitespace-only counts as missing):
 * - `en` → always `value.en` (when `value` is an object).
 * - `zh-Hant` → `zh-Hant` if set, else `en`.
 * - `zh-Hans` → `zh-Hans` if set, else `zh-Hant` if set, else `en`.
 *
 * Used by `LocalizedInline`, `LocalizedHtml`, `pickLocalizedText`, and any code
 * that renders per-slot strings for `html[data-lang]`.
 */
export function resolveLocalizedSlot(
  value: string | LocalizedText,
  slot: SiteLang,
): string {
  if (typeof value === "string") return value;
  if (slot === "en") return value.en;
  if (slot === "zh-Hant") {
    return nonEmptyLocalized(value["zh-Hant"]) ? value["zh-Hant"]! : value.en;
  }
  if (nonEmptyLocalized(value["zh-Hans"])) return value["zh-Hans"]!;
  if (nonEmptyLocalized(value["zh-Hant"])) return value["zh-Hant"]!;
  return value.en;
}

/** Resolve one language; supports legacy plain strings. */
export function pickLocalizedText(
  value: string | LocalizedText,
  lang: SiteLang,
): string {
  return resolveLocalizedSlot(value, lang);
}
