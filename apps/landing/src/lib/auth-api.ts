import { FETCH_TIMEOUT_MS } from "./constants";
import { TERMS_VERSION } from "./auth-constants";
import { getApiBaseUrl } from "./fetch-home";

export type RegisterPayload = {
  email: string;
  password: string;
  consentimiento: true;
  versionTerminos: typeof TERMS_VERSION;
};

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

type ApiErrorBody = {
  statusCode: number;
  code: string;
  message: string;
};

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

/** Formato real del backend: `{ error: { code, message } }`. */
type NestedApiErrorBody = {
  error: { code: string; message: string };
};

function isNestedApiErrorBody(data: unknown): data is NestedApiErrorBody {
  if (!data || typeof data !== "object") {
    return false;
  }
  const error = (data as Record<string, unknown>).error;
  if (!error || typeof error !== "object") {
    return false;
  }
  const record = error as Record<string, unknown>;
  return typeof record.code === "string" && typeof record.message === "string";
}

export async function readApiError(response: Response): Promise<ApiError> {
  try {
    const data: unknown = await response.json();
    if (isNestedApiErrorBody(data)) {
      return new ApiError(response.status, data.error.code, data.error.message);
    }
    if (isApiErrorBody(data)) {
      return new ApiError(data.statusCode, data.code, data.message);
    }
  } catch {
    // ignore parse errors
  }
  return new ApiError(response.status, "HTTP_ERROR", `HTTP ${response.status}`);
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  return error instanceof TypeError;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("PUBLIC_API_URL no está configurada");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function register(payload: RegisterPayload): Promise<void> {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await readApiError(response);
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await apiFetch("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  if (!response.ok) {
    throw await readApiError(response);
  }
}
