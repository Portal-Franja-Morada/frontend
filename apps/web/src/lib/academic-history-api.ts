import type {
  AcademicHistoryPatchBody,
  AcademicHistoryResponse,
  AcademicHistoryUploadResponse,
} from "../types/academic-history";
import { apiFetch, getApiBaseUrl, readApiError } from "./api";

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

function isHistoryResponse(data: unknown): data is AcademicHistoryResponse {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return typeof record.carrera === "string" && Array.isArray(record.registros);
}

export async function fetchAcademicHistory(
  carrera: string,
): Promise<AcademicHistoryResponse> {
  const response = await apiFetch(
    `/me/academic-history?carrera=${encodeURIComponent(carrera)}`,
  );
  if (!response.ok) throw await readApiError(response);
  const data: unknown = await response.json();
  if (!isHistoryResponse(data)) {
    throw new Error("Respuesta de historial inválida");
  }
  return data;
}

export async function patchAcademicRecord(
  carrera: string,
  codigo: string,
  body: AcademicHistoryPatchBody,
): Promise<void> {
  const response = await apiFetch(
    `/me/academic-history/${encodeURIComponent(codigo)}?carrera=${encodeURIComponent(carrera)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (response.status !== 204 && !response.ok) {
    throw await readApiError(response);
  }
}

export async function deleteImportedHistory(carrera: string): Promise<void> {
  const response = await apiFetch(
    `/me/academic-history?carrera=${encodeURIComponent(carrera)}`,
    { method: "DELETE" },
  );
  if (response.status !== 204 && !response.ok) {
    throw await readApiError(response);
  }
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
