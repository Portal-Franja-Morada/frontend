import { Button } from "@franja/ui/components/button";

type DeleteContentDialogProps = {
  titulo: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteContentDialog({
  titulo,
  busy,
  error,
  onConfirm,
  onCancel,
}: DeleteContentDialogProps) {
  const titleId = "delete-content-dialog-title";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-franja-dark/40 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="w-full max-w-[560px] rounded-[10px] border border-franja-border bg-white p-6 shadow-sm">
        <h2 id={titleId} className="text-xl font-bold text-franja-dark">
          {"¿Eliminar '" + titulo + "'? Esta acción no se puede deshacer."}
        </h2>
        {error ? (
          <p className="mt-4 text-sm font-bold text-franja-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="h-12 rounded-lg bg-franja-error text-sm font-bold text-white hover:bg-franja-error/90"
          >
            {busy ? "Eliminando…" : "Eliminar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onCancel}
            className="h-12 rounded-lg border-franja-border bg-white text-sm font-bold text-franja-morada"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
