import { formatDni } from "../lib/dni";

const MOTIVO_MIN = 5;
const MOTIVO_MAX = 500;

type RechazarVerificacionDialogProps = {
  open: boolean;
  dni: string;
  nombre: string;
  apellido: string;
  motivo: string;
  error: string | null;
  submitting: boolean;
  onMotivoChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function RechazarVerificacionDialog({
  open,
  dni,
  nombre,
  apellido,
  motivo,
  error,
  submitting,
  onMotivoChange,
  onConfirm,
  onCancel,
}: RechazarVerificacionDialogProps) {
  if (!open) return null;

  const trimmed = motivo.trim();
  const motivoInvalid =
    trimmed.length > 0 &&
    (trimmed.length < MOTIVO_MIN || trimmed.length > MOTIVO_MAX);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rechazar-verificacion-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="rechazar-verificacion-title"
            className="text-xl font-bold text-franja-dark"
          >
            Rechazar verificación
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="text-lg font-bold text-franja-morada disabled:opacity-50"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm font-bold text-franja-dark">
          {nombre} {apellido}
        </p>
        <p className="text-sm font-bold text-franja-muted">
          DNI {formatDni(dni)}
        </p>

        {error ? (
          <p className="mt-4 text-sm font-bold text-franja-error">{error}</p>
        ) : null}

        <div className="mt-4">
          <label className="block">
            <span className="text-sm font-bold text-franja-dark">
              Motivo (obligatorio)
            </span>
            <textarea
              value={motivo}
              onChange={(e) => onMotivoChange(e.target.value)}
              disabled={submitting}
              rows={3}
              maxLength={MOTIVO_MAX}
              className="mt-2 w-full rounded-lg border border-franja-border px-4 py-3 text-base text-franja-dark"
              placeholder="Contá brevemente el motivo"
            />
          </label>
          {motivoInvalid ? (
            <p className="mt-2 text-sm text-franja-error">
              El motivo tiene que tener entre {MOTIVO_MIN} y {MOTIVO_MAX}{" "}
              caracteres.
            </p>
          ) : null}
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-franja-error text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? "Rechazando…" : "Rechazar"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex h-[50px] w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function isRechazoMotivoValid(motivo: string): boolean {
  const trimmed = motivo.trim();
  return trimmed.length >= MOTIVO_MIN && trimmed.length <= MOTIVO_MAX;
}
