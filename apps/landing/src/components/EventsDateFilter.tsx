type EventsDateFilterProps = {
  periodLabel: string | null;
};

export function EventsDateFilter({ periodLabel }: EventsDateFilterProps) {
  return (
    <div
      className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center"
      aria-label="Filtro por fecha"
    >
      <span className="inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-5 text-sm font-bold text-white">
        Próximos eventos
      </span>

      {periodLabel ? (
        <span className="inline-flex h-12 items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada">
          {periodLabel}
        </span>
      ) : null}
    </div>
  );
}
