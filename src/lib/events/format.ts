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

export function fullDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Fri, May 3, 2024" — long form with weekday, for event detail pages */
export function formatDateLong(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
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
