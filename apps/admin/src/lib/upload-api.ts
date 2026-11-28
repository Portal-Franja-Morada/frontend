import { FETCH_TIMEOUT_MS } from "./constants";
import type { UploadResult } from "../types/content";
import { getApiBaseUrl, readApiError } from "./api";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadTipo = "novedad" | "evento";

function isUploadResult(data: unknown): data is UploadResult {
  if (!data || typeof data !== "object") {
    return false;
  }
  const record = data as Record<string, unknown>;
  return typeof record.url === "string" && typeof record.publicId === "string";
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "La imagen debe ser JPG, PNG o WEBP.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "La imagen supera los 2 MB.";
  }
  return null;
}

export async function uploadImage(
  file: File,
  tipo: UploadTipo,
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (validation) {
    throw new Error(validation);
  }

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_URL no está configurada");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const body = new FormData();
    body.append("tipo", tipo);
    body.append("file", file);

    const response = await fetch(`${baseUrl}/admin/uploads`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      body,
    });

    if (!response.ok) {
      throw await readApiError(response);
    }

    const data: unknown = await response.json();
    if (!isUploadResult(data)) {
      throw new Error("Respuesta de carga inválida");
    }
    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}
