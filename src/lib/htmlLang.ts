export type HtmlLang = "en" | "zh-Hant" | "zh-Hans";

/**
 * Map sermon language labels into valid HTML lang values for SEO/indexing.
 */
export function htmlLangFromSermonLanguage(input?: string): HtmlLang {
  const normalized = (input ?? "").toLowerCase();
  if (!normalized) return "en";

  if (normalized.includes("mandarin") || normalized.includes("simplified")) {
    return "zh-Hans";
  }

  if (normalized.includes("cantonese") || normalized.includes("traditional")) {
    return "zh-Hant";
  }

  if (normalized.includes("chinese")) {
    return "zh-Hant";
  }

  return "en";
}
