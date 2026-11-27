import type { ApuntesPlanResponse, ProveedorApuntes } from "../types/apuntes";
import { apiFetch, readApiError } from "./api";

function isApuntesPlanResponse(data: unknown): data is ApuntesPlanResponse {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.carrera === "string" &&
    typeof record.anioPlan === "number" &&
    Array.isArray(record.anios)
  );
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
