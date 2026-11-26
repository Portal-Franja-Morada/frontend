import type {
  CorregirIdentidadBody,
  IdentidadResponse,
  PendingResponse,
} from "../types/usuarios";
import { apiFetch, readApiError } from "./api";

function isPendingResponse(data: unknown): data is PendingResponse {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.verificacion === "object" &&
    typeof record.diferenciasPadron === "object"
  );
}

export async function fetchAdminPending(): Promise<PendingResponse> {
  const response = await apiFetch("/admin/pending");
  if (!response.ok) throw await readApiError(response);
  const data: unknown = await response.json();
  if (!isPendingResponse(data)) throw new Error("Respuesta inválida");
  return data;
}

export async function aplicarDiferenciaPadron(
  userId: string,
): Promise<IdentidadResponse> {
  const response = await apiFetch(
    `/admin/pending/diferencias-padron/${userId}/aplicar`,
    { method: "POST" },
  );
  if (!response.ok) throw await readApiError(response);
  return response.json() as Promise<IdentidadResponse>;
}

export async function descartarDiferenciaPadron(userId: string): Promise<void> {
  const response = await apiFetch(
    `/admin/pending/diferencias-padron/${userId}/descartar`,
    { method: "POST" },
  );
  if (response.status !== 204 && !response.ok) {
    throw await readApiError(response);
  }
}

export async function corregirIdentidad(
  userId: string,
  body: CorregirIdentidadBody,
): Promise<IdentidadResponse> {
  const response = await apiFetch(`/admin/usuarios/${userId}/identidad`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await readApiError(response);
  return response.json() as Promise<IdentidadResponse>;
}
