import { FETCH_TIMEOUT_MS } from "./constants";
import type { PadronImportResult } from "../types/padron";
import { getApiBaseUrl, readApiError } from "./api";

export const MAX_PADRON_BYTES = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = /\.(csv|xlsx|xls)$/i;

function isPadronImportResult(data: unknown): data is PadronImportResult {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return typeof record.insertados === "number" && Array.isArray(record.errores);
}

export function validatePadronFile(file: File): string | null {
  if (file.size > MAX_PADRON_BYTES) {
    return "El archivo pesa más de 5 MB.";
  }
  if (!ALLOWED_EXTENSIONS.test(file.name)) {
    return "Formato no soportado, subí un CSV o Excel.";
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function importPadron(file: File): Promise<PadronImportResult> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_URL no está configurada");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const body = new FormData();
    body.append("file", file);

    const response = await fetch(`${baseUrl}/admin/padron/import`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      body,
    });

    if (!response.ok) {
      throw await readApiError(response);
    }

    const data: unknown = await response.json();
    if (!isPadronImportResult(data)) {
      throw new Error("Respuesta de importación inválida");
    }
    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export const DEMO_IMPORT_RESULT: PadronImportResult = {
  insertados: 120,
  actualizados: 35,
  reverificados: 98,
  diferencias: 4,
  errores: [
    { fila: 14, motivo: "Falta el DNI" },
    { fila: 52, motivo: "La carrera no coincide con ninguna cargada" },
    { fila: 87, motivo: "DNI repetido en la planilla" },
  ],
};
