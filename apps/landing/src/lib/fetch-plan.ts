import type { PlanDetalle } from "../types/curriculum";
import { FETCH_TIMEOUT_MS } from "./constants";

function isPlanDetalle(data: unknown): data is PlanDetalle {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.carrera === "string" &&
    typeof record.anio_plan === "number" &&
    Array.isArray(record.materias)
  );
}

export class PlanNotFoundError extends Error {
  constructor() {
    super("Plan no encontrado");
    this.name = "PlanNotFoundError";
  }
}

export async function fetchPublicPlan(
  baseUrl: string,
  carrera: string,
  anio: number,
): Promise<PlanDetalle> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/public/plans/${carrera}/${anio}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (response.status === 404) {
      throw new PlanNotFoundError();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!isPlanDetalle(data)) {
      throw new Error("Respuesta inválida");
    }

    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}
