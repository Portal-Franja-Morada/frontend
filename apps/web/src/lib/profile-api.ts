import type { ProfileResponse, UpdateProfileBody } from "../types/profile";
import { apiFetch, readApiError } from "./api";

function isProfileResponse(data: unknown): data is ProfileResponse {
  if (!data || typeof data !== "object") {
    return false;
  }
  const record = data as Record<string, unknown>;
  const preferencias = record.preferencias;
  if (!preferencias || typeof preferencias !== "object") {
    return false;
  }
  const prefs = preferencias as Record<string, unknown>;
  return (
    typeof record.nombre === "string" &&
    typeof record.dni === "string" &&
    typeof prefs.perfilEmprendedor === "boolean"
  );
}

export async function fetchProfile(): Promise<ProfileResponse> {
  const response = await apiFetch("/me/profile");
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isProfileResponse(data)) {
    throw new Error("Respuesta de perfil inválida");
  }
  return data;
}

export async function patchProfile(
  body: UpdateProfileBody,
): Promise<ProfileResponse> {
  const response = await apiFetch("/me/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isProfileResponse(data)) {
    throw new Error("Respuesta de perfil inválida");
  }
  return data;
}
