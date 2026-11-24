import { cn } from "@franja/ui/lib/utils";

type NewsPaginationProps = {
  page: number;
  total: number;
  pages: number;
  from: number;
  to: number;
  pageNumbers: number[];
};

const pageLinkClass =
  "inline-flex h-12 items-center justify-center rounded-lg px-[22px] py-3.5 text-sm font-bold transition-opacity hover:opacity-90";

export function NewsPagination({
  page,
  total,
  pages,
  from,
  to,
  pageNumbers,
}: NewsPaginationProps) {
  if (total <= 0) {
    return null;
  }

  const showControls = pages > 1;

  return (
    <div className="flex flex-col gap-6">
      {showControls ? (
        <nav
          className="flex flex-wrap items-center gap-2.5"
          aria-label="Paginación de novedades"
        >
          {pageNumbers.map((pageNumber) => {
            const isActive = pageNumber === page;
            const href =
              pageNumber === 1 ? "/novedades" : `/novedades?page=${pageNumber}`;

            return (
              <a
                key={pageNumber}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  pageLinkClass,
                  isActive
                    ? "bg-franja-morada text-white"
                    : "bg-franja-gold text-franja-morada",
                )}
              >
                {pageNumber}
              </a>
            );
          })}

          {page < pages ? (
            <a
              href={`/novedades?page=${page + 1}`}
              className={cn(
                pageLinkClass,
                "bg-franja-gold text-franja-morada",
              )}
            >
              Siguiente →
            </a>
          ) : null}
        </nav>
      ) : null}

      <p className="text-[13px] font-normal text-franja-muted">
        Mostrando {from}–{to} de {total} novedades
      </p>
    </div>
  );
}