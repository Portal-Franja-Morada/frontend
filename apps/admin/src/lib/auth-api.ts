import type { MeResponse } from "../types/auth";
import { apiFetch, readApiError } from "./api";

function isMeResponse(data: unknown): data is MeResponse {
  if (!data || typeof data !== "object") {
    return false;
  }
  const record = data as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.email === "string" &&
    typeof record.rol === "string"
  );
}

export async function fetchCurrentUser(): Promise<MeResponse | null> {
  const response = await apiFetch("/auth/me");
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isMeResponse(data)) {
    throw new Error("Respuesta de sesión inválida");
  }
  return data;
}

export async function login(
  email: string,
  password: string,
): Promise<MeResponse> {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw await readApiError(response);
  }

  const data: unknown = await response.json();
  if (!isMeResponse(data)) {
    throw new Error("Respuesta de login inválida");
  }
  return data;
}

export async function logout(): Promise<void> {
  const response = await apiFetch("/auth/logout", { method: "POST" });
  if (response.status !== 204 && !response.ok) {
    throw await readApiError(response);
  }
}
