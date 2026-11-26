export type PendingDevState =
  | "cargando"
  | "vacio"
  | "error"
  | "diferencias"
  | "modal-corregir"
  | "sin-cambios"
  | "guardado-ok"
  | "diferencia-resuelta";

const DEV_STATES: PendingDevState[] = [
  "cargando",
  "vacio",
  "error",
  "diferencias",
  "modal-corregir",
  "sin-cambios",
  "guardado-ok",
  "diferencia-resuelta",
];

export function readPendingDevState(): PendingDevState | null {
  if (!import.meta.env.DEV || typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) return null;
  return DEV_STATES.includes(value as PendingDevState)
    ? (value as PendingDevState)
    : null;
}
