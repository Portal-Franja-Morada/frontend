import { cn } from "@franja/ui/lib/utils";

type EventsPaginationProps = {
  page: number;
  total: number;
  pages: number;
  from: number;
  to: number;
  pageNumbers: number[];
};

const pageLinkClass =
  "inline-flex h-12 items-center justify-center rounded-lg border px-5 py-3.5 text-sm font-bold transition-opacity hover:opacity-90";

export function EventsPagination({
  page,
  total,
  pages,
  from,
  to,
  pageNumbers,
}: EventsPaginationProps) {
  if (total <= 0) {
    return null;
  }

  const showControls = pages > 1;

  return (
    <div className="flex flex-col gap-6">
      {showControls ? (
        <nav
          className="flex flex-wrap items-center gap-2.5"
          aria-label="Paginación de eventos"
        >
          {pageNumbers.map((pageNumber) => {
            const isActive = pageNumber === page;
            const href =
              pageNumber === 1 ? "/eventos" : `/eventos?page=${pageNumber}`;

            return (
              <a
                key={pageNumber}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  pageLinkClass,
                  isActive
                    ? "border-franja-morada bg-franja-morada text-white"
                    : "border-franja-border bg-white text-franja-morada",
                )}
              >
                {pageNumber}
              </a>
            );
          })}

          {page < pages ? (
            <a
              href={`/eventos?page=${page + 1}`}
              className={cn(
                pageLinkClass,
                "border-franja-border bg-white text-franja-morada",
              )}
            >
              Siguiente →
            </a>
          ) : null}
        </nav>
      ) : null}

      <p className="text-[13px] font-normal text-franja-muted">
        Mostrando {from}–{to} de {total} eventos
      </p>
    </div>
  );
}
