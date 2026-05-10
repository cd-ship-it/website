/**
 * Serialize a value for safe embedding in `<script type="application/ld+json">`.
 * Normalizes double-encoded JSON strings, escapes `<` so `</script>` cannot break HTML,
 * and returns null when the payload cannot be represented as valid JSON-LD JSON.
 */
export function serializeJsonLd(data: unknown): string | null {
  let normalized: unknown = data;

  if (typeof normalized === "string") {
    try {
      normalized = JSON.parse(normalized);
    } catch {
      return null;
    }
    if (typeof normalized === "string") {
      try {
        normalized = JSON.parse(normalized);
      } catch {
        return null;
      }
    }
  }

  if (normalized === null || typeof normalized !== "object") {
    return null;
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(normalized);
  } catch {
    return null;
  }

  const safe = serialized.replace(/</g, "\\u003c");
  try {
    JSON.parse(safe);
  } catch {
    return null;
  }
  return safe;
}
