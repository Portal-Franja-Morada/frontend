const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

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

export function formatEventTime(iso: string): string {
  const time = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ARGENTINA_TZ,
  }).format(new Date(iso));
  return `${time} h`;
}

export function formatNewsCategory(publicadoAt: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: ARGENTINA_TZ,
  })
    .format(new Date(publicadoAt))
    .replace(/\./g, "")
    .toUpperCase();
}

export function formatPostDateLong(publicadoAt: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ARGENTINA_TZ,
  })
    .format(new Date(publicadoAt))
    .toUpperCase();
}
