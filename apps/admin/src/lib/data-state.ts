export type DataState = "ok" | "cargando" | "vacio" | "error";

export type EditorUiState = "confirmar" | "validacion" | "listo" | null;

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

export function readEditorUiPreview(): EditorUiState {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return null;
  }

  const estado = new URLSearchParams(window.location.search).get("estado");
  if (estado === "confirmar" || estado === "validacion" || estado === "listo") {
    return estado;
  }

  return null;
}
