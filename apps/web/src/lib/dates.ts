const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

export function formatDateArgentina(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: ARGENTINA_TZ,
  }).format(new Date(iso));
}
