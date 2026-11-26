const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";
const ARGENTINA_OFFSET = "-03:00";

export function argentinaLocalToIso(date: string, time: string): string {
  return `${date}T${time}:00${ARGENTINA_OFFSET}`;
}

export function isoToArgentinaDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: ARGENTINA_TZ,
  }).format(new Date(iso));
}

export function isoToArgentinaTime(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ARGENTINA_TZ,
  }).formatToParts(new Date(iso));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

export function isFinBeforeInicio(
  fecha: string,
  horaInicio: string,
  horaFin: string,
): boolean {
  if (!fecha || !horaInicio || !horaFin) {
    return false;
  }
  const start = Date.parse(argentinaLocalToIso(fecha, horaInicio));
  const end = Date.parse(argentinaLocalToIso(fecha, horaFin));
  return end < start;
}
