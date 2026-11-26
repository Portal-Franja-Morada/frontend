import type { CorregirIdentidadBody } from "../types/usuarios";
import { formatDni } from "../lib/dni";

type CorregirNombreDialogProps = {
  open: boolean;
  dni: string;
  nombre: string;
  apellido: string;
  motivo: string;
  error: string | null;
  submitting: boolean;
  onNombreChange: (value: string) => void;
  onApellidoChange: (value: string) => void;
  onMotivoChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function CorregirNombreDialog({
  open,
  dni,
  nombre,
  apellido,
  motivo,
  error,
  submitting,
  onNombreChange,
  onApellidoChange,
  onMotivoChange,
  onConfirm,
  onCancel,
}: CorregirNombreDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="corregir-nombre-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="corregir-nombre-title"
            className="text-xl font-bold text-franja-dark"
          >
            Corregir nombre
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

        <p className="mt-3 text-sm font-bold text-franja-muted">
          DNI {formatDni(dni)}
        </p>

        {error ? (
          <p className="mt-4 text-sm font-bold text-franja-error">{error}</p>
        ) : null}

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-franja-dark">Nombre</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              disabled={submitting}
              className="mt-2 h-12 w-full rounded-lg border border-franja-border px-4 text-base text-franja-dark"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-franja-dark">Apellido</span>
            <input
              type="text"
              value={apellido}
              onChange={(e) => onApellidoChange(e.target.value)}
              disabled={submitting}
              className="mt-2 h-12 w-full rounded-lg border border-franja-border px-4 text-base text-franja-dark"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-franja-dark">
              Motivo (obligatorio)
            </span>
            <textarea
              value={motivo}
              onChange={(e) => onMotivoChange(e.target.value)}
              disabled={submitting}
              rows={3}
              className="mt-2 w-full rounded-lg border border-franja-border px-4 py-3 text-base text-franja-dark"
              placeholder="Contá brevemente el motivo"
            />
          </label>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? "Guardando…" : "Guardar"}
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

export function buildCorregirBody(
  nombre: string,
  apellido: string,
  motivo: string,
  initialNombre: string,
  initialApellido: string,
): CorregirIdentidadBody | null {
  const trimmedMotivo = motivo.trim();
  if (trimmedMotivo.length < 5) return null;
  const body: CorregirIdentidadBody = { motivo: trimmedMotivo };
  const trimmedNombre = nombre.trim();
  const trimmedApellido = apellido.trim();
  if (trimmedNombre && trimmedNombre !== initialNombre.trim()) {
    body.nombre = trimmedNombre;
  }
  if (trimmedApellido && trimmedApellido !== initialApellido.trim()) {
    body.apellido = trimmedApellido;
  }
  if (!body.nombre && !body.apellido) return null;
  return body;
}
