import { FETCH_TIMEOUT_MS } from "./constants";
import type {
  ApunteMateria,
  ApuntesPlanResponse,
  ImportLinksResponse,
  ProveedorApuntes,
} from "../types/apuntes";
import { apiFetch, getApiBaseUrl, readApiError } from "./api";

export const MAX_APUNTES_IMPORT_BYTES = 1024 * 1024;

const ALLOWED_EXTENSIONS = /\.(csv|xlsx|xls)$/i;

const EXACT_HOSTS = [
  "onedrive.live.com",
  "1drv.ms",
  "drive.google.com",
  "docs.google.com",
];
const HOST_SUFFIXES = [".sharepoint.com"];

function isApuntesPlanResponse(data: unknown): data is ApuntesPlanResponse {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.carrera === "string" &&
    typeof record.anioPlan === "number" &&
    Array.isArray(record.anios)
  );
}

function isApunteMateria(data: unknown): data is ApunteMateria {
  if (!data || typeof data !== "object") return false;
  return typeof (data as ApunteMateria).codigo === "string";
}

function isImportLinksResponse(data: unknown): data is ImportLinksResponse {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.actualizados === "number" && Array.isArray(record.rechazados)
  );
}

export function validateApuntesFile(file: File): string | null {
  if (file.size > MAX_APUNTES_IMPORT_BYTES) {
    return "El archivo pesa más de 1 MB.";
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

export function validateApuntesLink(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "El link no puede estar vacío.";
  if (trimmed.length > 2048) return "El link no puede superar 2048 caracteres.";

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return "El texto no es una URL válida.";
  }

  if (url.protocol !== "https:") return "El link tiene que ser https.";
  if (url.username || url.password) {
    return "El link no puede incluir usuario ni contraseña.";
  }

  const host = url.hostname.toLowerCase();
  const ok =
    EXACT_HOSTS.includes(host) ||
    HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
  if (!ok) return "Solo se aceptan links de OneDrive o Google Drive.";
  return null;
}

export function proveedorLabel(proveedor: ProveedorApuntes | null): string {
  if (proveedor === "google-drive") return "Google Drive";
  if (proveedor === "onedrive") return "OneDrive";
  return "—";
}

export async function fetchApuntesPlan(
  carrera: string,
  plan: number,
): Promise<ApuntesPlanResponse> {
  const response = await apiFetch(
    `/apuntes?carrera=${encodeURIComponent(carrera)}&plan=${plan}`,
  );
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isApuntesPlanResponse(data)) {
    throw new Error("Respuesta de apuntes inválida");
  }
  return data;
}

export async function upsertApunteLink(
  carrera: string,
  plan: number,
  codigo: string,
  link: string,
): Promise<ApunteMateria> {
  const response = await apiFetch(
    `/admin/apuntes/${encodeURIComponent(carrera)}/${plan}/${encodeURIComponent(codigo)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link }),
    },
  );
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isApunteMateria(data)) {
    throw new Error("Respuesta inválida");
  }
  return data;
}

export async function deleteApunteLink(
  carrera: string,
  plan: number,
  codigo: string,
): Promise<void> {
  const response = await apiFetch(
    `/admin/apuntes/${encodeURIComponent(carrera)}/${plan}/${encodeURIComponent(codigo)}`,
    { method: "DELETE" },
  );
  if (!response.ok && response.status !== 204) {
    throw await readApiError(response);
  }
}

export async function importApuntesFile(
  file: File,
): Promise<ImportLinksResponse> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_URL no está configurada");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const body = new FormData();
    body.append("file", file);

    const response = await fetch(`${baseUrl}/admin/apuntes/import-archivo`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      body,
    });

    if (!response.ok) {
      throw await readApiError(response);
    }

    const data: unknown = await response.json();
    if (!isImportLinksResponse(data)) {
      throw new Error("Respuesta de importación inválida");
    }
    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function exportApuntesPlan(
  carrera: string,
  plan: number,
): Promise<{ filename: string; blob: Blob }> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_URL no está configurada");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${baseUrl}/admin/apuntes/export?carrera=${encodeURIComponent(carrera)}&plan=${plan}`,
      {
        credentials: "include",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw await readApiError(response);
    }

    const disposition = response.headers.get("content-disposition") ?? "";
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] ?? `apuntes-${carrera}-${plan}.csv`;
    const blob = await response.blob();
    return { filename, blob };
  } finally {
    window.clearTimeout(timeout);
  }
}

export const DEMO_APUNTES_IMPORT_RESULT: ImportLinksResponse = {
  actualizados: 18,
  sinCambios: 4,
  omitidos: 2,
  rechazados: [
    { fila: 7, motivo: "Solo se aceptan links de OneDrive o Google Drive" },
    { fila: 12, motivo: "Materia no encontrada en ese plan" },
    { fila: 19, motivo: "Carrera no válida" },
  ],
};
