import { getLandingSiteUrl } from "../lib/constants";
import type { MeResponse } from "../types/auth";

export type VerificationImportGateVariant =
  "sin-enviar" | "pendiente" | "rechazado";

export function verificationImportVariant(
  user: MeResponse | null,
): VerificationImportGateVariant | null {
  if (!user) return "sin-enviar";
  if (
    user.rol === "VERIFIED_STUDENT" &&
    user.perfil?.estadoVerificacion === "verificado"
  ) {
    return null;
  }
  if (user.perfil?.estadoVerificacion === "rechazado") return "rechazado";
  if (
    user.perfil?.estadoVerificacion === "pendiente" ||
    user.verificacion.estado === "pendiente"
  ) {
    return "pendiente";
  }
  return "sin-enviar";
}

function rejectionReason(user: MeResponse | null): string {
  if (user?.verificacion.motivoRechazo) return user.verificacion.motivoRechazo;
  if (user?.verificacion.motivo === "dni_no_en_padron") {
    return "el DNI no figura en el padrón de alumnos";
  }
  if (user?.verificacion.motivo === "nombre_no_coincide") {
    return "el nombre no coincide con el padrón";
  }
  return "revisá tus datos y volvé a enviar";
}

export function VerificationImportGate({
  variant,
  user,
}: {
  variant: VerificationImportGateVariant;
  user: MeResponse | null;
}) {
  const landing = getLandingSiteUrl();

  if (variant === "pendiente") {
    return (
      <div className="mt-6 space-y-3 rounded-lg border border-franja-border bg-franja-surface p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
          En revisión
        </p>
        <h3 className="text-base font-bold text-franja-dark">
          Verificá tu cuenta para importar
        </h3>
        <p className="text-sm text-franja-muted">
          El centro de estudiantes está revisando tu verificación. Todavía no
          podés importar.
        </p>
      </div>
    );
  }

  if (variant === "rechazado") {
    return (
      <div className="mt-6 space-y-3 rounded-lg border border-franja-border bg-franja-rose p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-franja-error">
          Rechazada
        </p>
        <h3 className="text-base font-bold text-franja-dark">
          Verificá tu cuenta para importar
        </h3>
        <p className="text-sm text-franja-muted">
          Motivo: {rejectionReason(user)}.
        </p>
        <a
          href={`${landing}/verificacion`}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-franja-morada px-5 text-sm font-bold text-white"
        >
          Reenviar verificación
        </a>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3 rounded-lg border border-franja-border bg-franja-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-error">
        Sin enviar
      </p>
      <h3 className="text-base font-bold text-franja-dark">
        Verificá tu cuenta para importar
      </h3>
      <p className="text-sm text-franja-muted">
        Para importar PDFs del SIU tu cuenta tiene que estar verificada.
      </p>
      <a
        href={`${landing}/verificacion`}
        className="inline-flex h-11 items-center justify-center rounded-lg bg-franja-morada px-5 text-sm font-bold text-white"
      >
        Verificar mi cuenta
      </a>
    </div>
  );
}
