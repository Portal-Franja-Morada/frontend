type DeleteAccountDialogProps = {
  open: boolean;
  password: string;
  error: string | null;
  submitting: boolean;
  onPasswordChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteAccountDialog({
  open,
  password,
  error,
  submitting,
  onPasswordChange,
  onConfirm,
  onCancel,
}: DeleteAccountDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="delete-account-title"
            className="text-xl font-bold text-franja-dark"
          >
            ¿Dar de baja tu cuenta?
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

        <p className="mt-3 text-base text-franja-muted">
          Se borran tus datos personales. No se puede deshacer.
        </p>

        <label className="mt-6 block">
          <span className="text-sm font-bold text-franja-dark">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="current-password"
            disabled={submitting}
            className="mt-2 h-12 w-full rounded-lg border border-franja-border px-4 text-base text-franja-dark"
          />
          <span className="mt-2 block text-sm text-franja-muted">
            Escribila para confirmar.
          </span>
          {error ? (
            <span className="mt-2 block text-sm font-bold text-franja-error">
              {error}
            </span>
          ) : null}
        </label>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-franja-error text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? "Procesando…" : "Dar de baja"}
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
