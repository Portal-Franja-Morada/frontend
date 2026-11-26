import { Button } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import type { ReactNode } from "react";

type OverlayCardProps = {
  children: ReactNode;
  className?: string;
};

function OverlayCard({ children, className }: OverlayCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[560px] rounded-[10px] border border-franja-border bg-white p-6 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

type PublishConfirmOverlayProps = {
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
};

export function PublishConfirmOverlay({
  onConfirm,
  onCancel,
  busy,
}: PublishConfirmOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-franja-dark/40 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
    >
      <OverlayCard>
        <h2
          id="publish-dialog-title"
          className="text-xl font-bold text-franja-dark"
        >
          ¿PUBLICAMOS ESTA NOVEDAD?
        </h2>
        <p className="mt-3 text-base text-franja-muted">
          Va a quedar visible para toda la comunidad. Revisá el título, la
          imagen y el contenido antes de continuar.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="h-12 rounded-lg bg-franja-morada text-sm font-bold text-white hover:bg-franja-morada/90"
          >
            Sí, publicar
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onCancel}
            className="h-12 rounded-lg border-franja-border bg-white text-sm font-bold text-franja-morada"
          >
            Seguir editando
          </Button>
        </div>
      </OverlayCard>
    </div>
  );
}

type ValidationOverlayProps = {
  onBack: () => void;
};

export function ValidationOverlay({ onBack }: ValidationOverlayProps) {
  return (
    <div className="mb-6 w-full max-w-[632px]">
      <OverlayCard className="border-franja-error/30">
        <p className="text-xs font-bold uppercase tracking-wide text-franja-error">
          Revisá los campos
        </p>
        <p className="mt-2 text-base text-franja-muted">
          Agregá un título y el cuerpo de la novedad.
        </p>
        <p className="mt-2 text-[13px] text-franja-muted">
          No se publicó nada. Tus cambios se conservan.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="mt-4 h-12 rounded-lg border-franja-border bg-white text-sm font-bold text-franja-morada"
        >
          Volver al formulario
        </Button>
      </OverlayCard>
    </div>
  );
}

export function PublishSuccessBanner() {
  return (
    <div className="mb-6 w-full max-w-[632px] rounded-[10px] border border-franja-border bg-white p-[18px]">
      <p className="text-sm font-bold text-[#246448]">¡Novedad publicada!</p>
      <p className="mt-2 text-[13px] text-franja-muted">
        La publicación ya está disponible en el sitio.
      </p>
    </div>
  );
}
