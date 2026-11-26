const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

export function formatPreviewDate(date = new Date()): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: ARGENTINA_TZ,
  })
    .format(date)
    .replace(/\./g, "")
    .toUpperCase();
}

export function formatLastSavedTime(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ARGENTINA_TZ,
  }).format(date);
}

export function formatAdminListDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: ARGENTINA_TZ,
  }).format(date);
}

export function previewCategoryFromTitle(titulo: string): string {
  const trimmed = titulo.trim();
  if (!trimmed) {
    return "NOVEDADES";
  }
  const head = trimmed.split(":")[0]?.trim() ?? trimmed;
  const word = head.split(/\s+/)[0] ?? "NOVEDADES";
  return word.toUpperCase();
}
