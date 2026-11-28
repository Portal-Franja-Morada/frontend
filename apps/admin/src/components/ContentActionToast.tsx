type ContentActionToastProps = {
  message: string;
  onDismiss: () => void;
};

export function ContentActionToast({
  message,
  onDismiss,
}: ContentActionToastProps) {
  return (
    <div
      className="fixed bottom-5 left-1/2 z-40 w-[min(100%-2.5rem,28rem)] -translate-x-1/2 rounded-lg border border-franja-border bg-white p-4 shadow-lg"
      role="status"
      aria-live="polite"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[#246448]">
        {message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 text-sm font-bold text-franja-morada"
      >
        Cerrar
      </button>
    </div>
  );
}
