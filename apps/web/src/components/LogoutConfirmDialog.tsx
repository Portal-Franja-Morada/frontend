import { cn } from "@franja/ui/lib/utils";

type LogoutConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function LogoutConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: LogoutConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
          ¿CERRÁS SESIÓN?
        </p>
        <h2
          id="logout-title"
          className="mt-3 text-[26px] font-bold text-franja-dark"
        >
          ¿CERRÁS SESIÓN?
        </h2>
        <p className="mt-2 text-base text-franja-muted">
          Para volver a ver tu perfil vas a tener que ingresar de nuevo.
        </p>
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white",
            )}
          >
            Sí, cerrar sesión
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-[50px] w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
          >
            Seguir en el portal
          </button>
        </div>
      </div>
    </div>
  );
}
