import type { AcademicHistoryUploadResponse } from "../types/academic-history";
import { getApiBaseUrl, readApiError } from "./api";

const UPLOAD_TIMEOUT_MS = 30_000;

function isUploadResponse(
  data: unknown,
): data is AcademicHistoryUploadResponse {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return (
    (record.tipoDocumento === "plan" || record.tipoDocumento === "historial") &&
    typeof record.carrera === "string" &&
    typeof record.anioPlan === "number" &&
    Array.isArray(record.advertencias)
  );
}

export async function uploadAcademicHistoryPdf(
  file: File,
): Promise<AcademicHistoryUploadResponse> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_URL no está configurada");
  }

  const formData = new FormData();
  formData.append("file", file);

  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    UPLOAD_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${baseUrl}/me/academic-history/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw await readApiError(response);
    }

    const data: unknown = await response.json();
    if (!isUploadResponse(data)) {
      throw new Error("Respuesta de importación inválida");
    }
    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}
