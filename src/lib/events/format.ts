export function monthLabel(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`)
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
}

export function dayNum(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { day: "2-digit" });
}

export function weekDay(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

/** e.g. "Mon, Jun 7" — no year (event listings) */
export function fullDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Same as fullDate: weekday + short month + day, no year (event detail hero) */
export function formatDateLong(dateStr: string): string {
  return fullDate(dateStr);
}

export function rangeLabel(
  startDate: string,
  endDate: string | undefined,
  time: string | undefined,
): string {
  const start = fullDate(startDate);
  const end = endDate && endDate !== startDate ? fullDate(endDate) : "";
  const dateText = end ? `${start} - ${end}` : start;
  return time ? `${dateText} • ${time}` : dateText;
}
