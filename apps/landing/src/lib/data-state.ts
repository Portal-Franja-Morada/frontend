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

export function sectionDataState(
  fetchState: "idle" | "loading" | "error" | "ok",
  itemCount: number,
): DataState {
  if (fetchState === "loading") {
    return "cargando";
  }
  if (fetchState === "error") {
    return "error";
  }
  if (itemCount === 0) {
    return "vacio";
  }
  return "ok";
}
