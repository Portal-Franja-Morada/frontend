import type { CurriculumMapResponse } from "../types/curriculum";
import { apiFetch, readApiError } from "./api";

function isMapResponse(data: unknown): data is CurriculumMapResponse {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.mapa === "object" &&
    record.mapa !== null &&
    typeof record.plan === "object" &&
    record.plan !== null
  );
}

export async function fetchCurriculumMap(
  carrera?: string,
  plan?: number,
): Promise<CurriculumMapResponse> {
  const params = new URLSearchParams();
  if (carrera) params.set("carrera", carrera);
  if (plan !== undefined) params.set("plan", String(plan));
  const qs = params.toString();
  const response = await apiFetch(`/me/curriculum-map${qs ? `?${qs}` : ""}`);
  if (!response.ok) throw await readApiError(response);
  const data: unknown = await response.json();
  if (!isMapResponse(data)) throw new Error("Respuesta del mapa inválida");
  return data;
}
