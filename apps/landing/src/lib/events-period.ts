const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

type YearMonth = {
  year: number;
  month: number;
  monthName: string;
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function yearMonthFromIso(iso: string): YearMonth {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "numeric",
    timeZone: ARGENTINA_TZ,
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value ?? "0");
  const month = Number(
    parts.find((part) => part.type === "month")?.value ?? "0",
  );
  const monthName = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    timeZone: ARGENTINA_TZ,
  }).format(date);

  return { year, month, monthName };
}

export function formatEventsPeriodLabel(inicioDates: string[]): string | null {
  if (inicioDates.length === 0) {
    return null;
  }

  const unique = new Map<string, YearMonth>();
  for (const iso of inicioDates) {
    const value = yearMonthFromIso(iso);
    unique.set(`${value.year}-${value.month}`, value);
  }

  const sorted = [...unique.values()].sort(
    (left, right) => left.year - right.year || left.month - right.month,
  );

  if (sorted.length === 1) {
    const only = sorted[0];
    return `${capitalize(only.monthName)} ${only.year}`;
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const sameYear = sorted.every((item) => item.year === first.year);

  if (sameYear) {
    return `${capitalize(first.monthName)}–${last.monthName.toLowerCase()} ${first.year}`;
  }

  return `${capitalize(first.monthName)} ${first.year}–${last.monthName.toLowerCase()} ${last.year}`;
}
