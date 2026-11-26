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

export function formatEventDay(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    timeZone: ARGENTINA_TZ,
  }).format(new Date(iso));
}

export function formatEventMonth(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    month: "short",
    timeZone: ARGENTINA_TZ,
  })
    .format(new Date(iso))
    .replace(/\./g, "")
    .toUpperCase();
}

export function formatEventTimeRange(
  inicio: string,
  fin: string | null,
): string {
  const start = formatLastSavedTime(new Date(inicio));
  if (!fin) {
    return `${start} h`;
  }
  const end = formatLastSavedTime(new Date(fin));
  return `${start} a ${end} h`;
}

export function formatEventPreviewMeta(
  fecha: string,
  horaInicio: string,
): string {
  if (!fecha || !horaInicio) {
    return "Fecha y horario del evento";
  }
  const [year, month, day] = fecha.split("-");
  const monthLabel = new Intl.DateTimeFormat("es-AR", {
    month: "short",
    timeZone: ARGENTINA_TZ,
  })
    .format(new Date(Number(year), Number(month) - 1, Number(day)))
    .replace(/\./g, "")
    .toUpperCase();
  return `${day} ${monthLabel} ${year} · ${horaInicio} H`;
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
