import { Button } from "./button";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
};

export function ErrorState({
  title = "Algo no salió bien",
  message = "No pudimos cargar el contenido. Probá de nuevo.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex w-full flex-col gap-2.5 rounded-[10px] border border-franja-border bg-white p-[18px]"
    >
      <p className="text-sm font-bold text-franja-error">{title}</p>
      <p className="text-[13px] text-franja-muted">{message}</p>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="h-[46px] w-[120px] rounded-lg border-franja-border bg-white text-sm font-bold text-franja-morada hover:bg-franja-surface"
      >
        Reintentar
      </Button>
    </div>
  );
}
