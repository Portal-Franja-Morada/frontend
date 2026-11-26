import { apiFetch, readApiError } from "./auth-api";

export type VerificationReason = "dni_no_en_padron" | "nombre_no_coincide";

export type VerificationStatus =
  "sin_enviar" | "pendiente" | "verificado" | "rechazado";

export type MeVerification = {
  emailVerificado: boolean;
  verificacion: {
    estado: VerificationStatus;
    motivo: VerificationReason | null;
    motivoRechazo: string | null;
  };
};

export type VerificationPayload = {
  dni: string;
  nombre: string;
  apellido: string;
};

export type VerificationResult = {
  estado: "verificado" | "pendiente";
  motivo: VerificationReason | null;
};

/** Sesión actual. Lanza `ApiError` con status 401 si no hay sesión. */
export async function fetchMeVerification(): Promise<MeVerification> {
  const response = await apiFetch("/auth/me");
  if (!response.ok) {
    throw await readApiError(response);
  }
  return (await response.json()) as MeVerification;
}

export async function submitVerification(
  payload: VerificationPayload,
): Promise<VerificationResult> {
  const response = await apiFetch("/me/verificacion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw await readApiError(response);
  }
  return (await response.json()) as VerificationResult;
}

export async function resendEmailVerification(): Promise<void> {
  const response = await apiFetch("/auth/resend-verification", {
    method: "POST",
  });
  if (!response.ok) {
    throw await readApiError(response);
  }
}
