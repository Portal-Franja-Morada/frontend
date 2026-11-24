type EmptyStateProps = {
  title?: string;
  message: string;
};

export function EmptyState({
  title = "Sin contenido",
  message,
}: EmptyStateProps) {
  return (
    <div className="flex w-full max-w-[632px] flex-col gap-2.5 rounded-[10px] border border-franja-border bg-white p-[18px]">
      <p className="text-sm font-bold text-franja-morada">{title}</p>
      <p className="text-[13px] text-franja-muted">{message}</p>
    </div>
  );
}
