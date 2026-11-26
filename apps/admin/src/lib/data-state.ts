export type DataState = "ok" | "cargando" | "vacio" | "error";

export function readPreviewDataState(): DataState | null {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return null;
  }

  const estado = new URLSearchParams(window.location.search).get("estado");
  if (estado === "cargando" || estado === "vacio" || estado === "error") {
    return estado;
  }

  return null;
}
