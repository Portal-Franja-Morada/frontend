type EditarLinkApuntesDialogProps = {
  open: boolean;
  codigo: string;
  nombre: string;
  link: string;
  tieneApuntes: boolean;
  error: string | null;
  submitting: boolean;
  onLinkChange: (value: string) => void;
  onSave: () => void;
  onRemove: () => void;
  onCancel: () => void;
};

export function EditarLinkApuntesDialog({
  open,
  codigo,
  nombre,
  link,
  tieneApuntes,
  error,
  submitting,
  onLinkChange,
  onSave,
  onRemove,
  onCancel,
}: EditarLinkApuntesDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editar-link-apuntes-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="editar-link-apuntes-title"
            className="text-xl font-bold text-franja-dark"
          >
            Link de apuntes
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
          {codigo} · {nombre}
        </p>

        <p className="mt-2 text-sm text-franja-muted">
          Pegá un link de OneDrive o Google Drive. Los estudiantes lo van a ver
          en el banco de apuntes.
        </p>

        {error ? (
          <p className="mt-4 text-sm font-bold text-franja-error">{error}</p>
        ) : null}

        <label className="mt-4 block">
          <span className="text-sm font-bold text-franja-dark">Link</span>
          <input
            type="url"
            value={link}
            onChange={(e) => onLinkChange(e.target.value)}
            disabled={submitting}
            placeholder="https://onedrive.live.com/..."
            className="mt-2 h-12 w-full rounded-lg border border-franja-border px-4 text-base text-franja-dark"
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={submitting || !link.trim()}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? "Guardando…" : "Guardar"}
          </button>
          {tieneApuntes ? (
            <button
              type="button"
              onClick={() => void onRemove()}
              disabled={submitting}
              className="text-sm font-bold text-franja-error disabled:opacity-50"
            >
              Quitar link
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="text-sm font-bold text-franja-muted disabled:opacity-50 sm:ml-auto"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
