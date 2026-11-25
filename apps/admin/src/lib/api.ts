import { FETCH_TIMEOUT_MS } from "./constants";
import type { ApiErrorBody } from "../types/auth";

export function getApiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) {
    return null;
  }
  return raw.replace(/\/$/, "");
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  if (!data || typeof data !== "object") {
    return false;
  }
  const record = data as Record<string, unknown>;
  return (
    typeof record.statusCode === "number" &&
    typeof record.code === "string" &&
    typeof record.message === "string"
  );
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_URL no está configurada");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    });
    return response;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function readApiError(response: Response): Promise<ApiError> {
  try {
    const data: unknown = await response.json();
    if (isApiErrorBody(data)) {
      return new ApiError(data.statusCode, data.code, data.message);
    }
  } catch {
    // ignore json parse errors
  }
  return new ApiError(response.status, "HTTP_ERROR", `HTTP ${response.status}`);
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  return error instanceof TypeError;
}
