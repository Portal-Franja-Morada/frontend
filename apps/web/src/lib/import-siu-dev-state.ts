export type ImportSiuDevState =
  | "subiendo"
  | "exito-plan"
  | "exito-historial"
  | "error-tamano"
  | "error-no-pdf"
  | "error-no-siu"
  | "error-plan-no-soportado"
  | "error-historial-sin-plan"
  | "error-rate-limit"
  | "error-timeout"
  | "error-plan-no-coincide"
  | "verificacion-sin-enviar"
  | "verificacion-pendiente"
  | "verificacion-rechazada"
  | "verificacion-verificada";

const DEV_STATES: ImportSiuDevState[] = [
  "subiendo",
  "exito-plan",
  "exito-historial",
  "error-tamano",
  "error-no-pdf",
  "error-no-siu",
  "error-plan-no-soportado",
  "error-historial-sin-plan",
  "error-rate-limit",
  "error-timeout",
  "error-plan-no-coincide",
  "verificacion-sin-enviar",
  "verificacion-pendiente",
  "verificacion-rechazada",
  "verificacion-verificada",
];

export function readImportSiuDevState(): ImportSiuDevState | null {
  if (!import.meta.env.DEV) return null;
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) return null;
  return DEV_STATES.includes(value as ImportSiuDevState)
    ? (value as ImportSiuDevState)
    : null;
}
