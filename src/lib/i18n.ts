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
    blog: string;
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
      blog: "Blog",
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
      blog: "文章",
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
      blog: "文章",
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

/**
 * Resolves text for a language slot. Missing, empty, or whitespace-only
 * `zh-Hant` / `zh-Hans` values fall back to `en` so nothing renders blank.
 */
export function resolveLocalizedSlot(
  value: string | LocalizedText,
  slot: SiteLang,
): string {
  if (typeof value === "string") return value;
  if (slot === "en") return value.en;
  const raw = value[slot];
  if (raw != null && String(raw).trim() !== "") return raw;
  return value.en;
}

/** Resolve one language; supports legacy plain strings. */
export function pickLocalizedText(
  value: string | LocalizedText,
  lang: SiteLang,
): string {
  return resolveLocalizedSlot(value, lang);
}
