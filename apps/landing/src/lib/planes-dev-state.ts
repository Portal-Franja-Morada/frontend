export type PlanesDevState = "cargando" | "vacio" | "error";

const DEV_STATES: PlanesDevState[] = ["cargando", "vacio", "error"];

export function readPlanesDevState(): PlanesDevState | null {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return null;
  }

  const estado = new URLSearchParams(window.location.search).get("estado");
  if (!estado) return null;

  return DEV_STATES.includes(estado as PlanesDevState)
    ? (estado as PlanesDevState)
    : null;
}
