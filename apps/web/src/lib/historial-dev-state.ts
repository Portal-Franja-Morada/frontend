export type HistorialDevState =
  | "cargando"
  | "error"
  | "vacio"
  | "sin-plan"
  | "sin-plan-sin-verificar"
  | "guardado-ok"
  | "editar"
  | "confirmar-borrado";

const DEV_STATES: HistorialDevState[] = [
  "cargando",
  "error",
  "vacio",
  "sin-plan",
  "sin-plan-sin-verificar",
  "guardado-ok",
  "editar",
  "confirmar-borrado",
];

export function readHistorialDevState(): HistorialDevState | null {
  if (!import.meta.env.DEV) return null;
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) return null;
  return DEV_STATES.includes(value as HistorialDevState)
    ? (value as HistorialDevState)
    : null;
}
