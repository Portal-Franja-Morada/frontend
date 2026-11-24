export type DataState = "ok" | "cargando" | "vacio" | "error";

export function readDataStateFromUrl(): DataState {
  if (typeof window === "undefined") {
    return "ok";
  }

  const estado = new URLSearchParams(window.location.search).get("estado");
  if (estado === "cargando" || estado === "vacio" || estado === "error") {
    return estado;
  }

  return "ok";
}

export function retryDataLoad() {
  const url = new URL(window.location.href);
  url.searchParams.delete("estado");
  window.location.href = url.toString();
}
