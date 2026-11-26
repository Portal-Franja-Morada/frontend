export function DeleteImportDialog({
  open,
  deleting,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-import-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2
          id="delete-import-title"
          className="whitespace-pre-line text-[26px] font-bold text-franja-dark"
        >
          ¿BORRAMOS LO IMPORTADO{"\n"}DEL SIU?
        </h2>
        <p className="mt-2 text-base text-franja-muted">
          Se borra lo que vino del SIU. Lo que editaste a mano se mantiene.
        </p>
        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white disabled:opacity-60"
          >
            Sí, borrar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-[50px] w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
