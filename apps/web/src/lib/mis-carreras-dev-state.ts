export type MisCarrerasDevState =
  "cargando" | "error" | "guardado-ok" | "limite-4" | "agregar-sin-verificar";

const DEV_STATES: MisCarrerasDevState[] = [
  "cargando",
  "error",
  "guardado-ok",
  "limite-4",
  "agregar-sin-verificar",
];

export function readMisCarrerasDevState(): MisCarrerasDevState | null {
  if (!import.meta.env.DEV) return null;
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) return null;
  return DEV_STATES.includes(value as MisCarrerasDevState)
    ? (value as MisCarrerasDevState)
    : null;
}
