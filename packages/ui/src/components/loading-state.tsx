function LoadingBar() {
  return (
    <div
      aria-hidden="true"
      className="h-2.5 w-[100px] rounded-[5px] bg-franja-border motion-safe:animate-pulse"
    />
  );
}

export function LoadingState() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full max-w-[560px] flex-col gap-2.5 rounded-[10px] border border-franja-border bg-white p-[18px]"
    >
      <p className="text-sm font-bold text-franja-morada">Cargando</p>
      <div className="flex flex-col gap-2.5">
        <LoadingBar />
        <LoadingBar />
      </div>
      <p className="text-[13px] text-franja-muted">
        Estamos buscando la información…
      </p>
    </div>
  );
}
