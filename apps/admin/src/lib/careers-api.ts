import { apiFetch, readApiError } from "./api";
import type { CareersResponse } from "../types/apuntes";

function isCareersResponse(data: unknown): data is CareersResponse {
  if (!data || typeof data !== "object") return false;
  return Array.isArray((data as CareersResponse).items);
}

export async function fetchPublicCareers(): Promise<CareersResponse> {
  const response = await apiFetch("/public/careers");
  if (!response.ok) {
    throw await readApiError(response);
  }
  const data: unknown = await response.json();
  if (!isCareersResponse(data)) {
    throw new Error("Respuesta de carreras inválida");
  }
  return data;
}

export function planLabel(anio: number, vigente: boolean): string {
  return vigente ? `Plan ${anio} (vigente)` : `Plan ${anio}`;
}
