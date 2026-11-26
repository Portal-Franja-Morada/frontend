import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { Link } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { AdminPostsPagination } from "../components/AdminPostsPagination";
import { PostStatusBadge } from "../components/PostStatusBadge";
import { PostsStats } from "../components/PostsStats";
import { useAdminEventsPage } from "../hooks/use-admin-events-page";
import { formatAdminListDate } from "../lib/dates";

const inputClassName =
  "h-14 w-full rounded-lg border border-franja-border bg-white px-4 text-base text-franja-dark outline-none transition-colors placeholder:text-franja-muted focus:border-franja-morada";

export function EventosPage() {
  const {
    events,
    stats,
    dataState,
    page,
    total,
    pages,
    from,
    to,
    searchInput,
    setSearchInput,
    selectValue,
    setEstadoFilter,
    goToPage,
    retry,
  } = useAdminEventsPage();

  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-8 px-5 py-8 lg:px-10 lg:py-10">
        <nav aria-label="Recorrido" className="text-[13px] text-franja-muted">
          Administración / Eventos
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[26px] font-bold text-franja-dark lg:text-[36px]">
              EVENTOS
            </h1>
            <p className="mt-2 text-base text-franja-muted">
              Organizá lo que la comunidad necesita saber.
            </p>
          </div>
          <Link
            to="/eventos/nuevo"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-franja-morada px-5 text-sm font-bold text-white transition-colors hover:bg-franja-morada/90"
          >
            + Crear evento
          </Link>
        </div>

        <PostsStats stats={stats} />

        <div className="flex flex-col gap-4 lg:flex-row">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar eventos…"
            className={inputClassName}
            aria-label="Buscar eventos"
          />
          <label className="sr-only" htmlFor="eventos-estado-filter">
            Filtrar por estado
          </label>
          <select
            id="eventos-estado-filter"
            value={selectValue}
            onChange={(event) =>
              setEstadoFilter(
                event.target.value as "todos" | "borrador" | "publicado",
              )
            }
            className={cn(inputClassName, "lg:max-w-[220px]")}
          >
            <option value="todos">Todos los estados</option>
            <option value="publicado">Publicados</option>
            <option value="borrador">Borradores</option>
          </select>
        </div>

        {dataState === "cargando" ? <LoadingState /> : null}
        {dataState === "vacio" ? (
          <EmptyState message="Todavía no hay eventos cargados" />
        ) : null}
        {dataState === "error" ? <ErrorState onRetry={retry} /> : null}

        {dataState === "ok" ? (
          <div className="flex flex-col gap-4">
            <div className="hidden overflow-hidden rounded-[10px] border border-franja-border bg-white lg:block">
              <table className="w-full text-left">
                <thead className="border-b border-franja-border bg-franja-surface">
                  <tr>
                    {["TÍTULO", "FECHA", "ESTADO", "ACCIÓN"].map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-5 py-3 text-xs font-bold text-franja-muted"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-franja-border last:border-b-0"
                    >
                      <td className="px-5 py-4 text-sm font-bold text-franja-dark">
                        {event.titulo}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-franja-muted">
                        {formatAdminListDate(event.inicio)}
                      </td>
                      <td className="px-5 py-4">
                        <PostStatusBadge estado={event.estado} />
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/eventos/${event.id}/editar`}
                          state={{ event }}
                          className="text-sm font-bold text-franja-morada"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 lg:hidden">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="flex flex-col gap-3 rounded-[10px] border border-franja-border bg-white p-5"
                >
                  <p className="text-sm font-bold text-franja-dark">
                    {event.titulo}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] text-franja-muted">
                      {formatAdminListDate(event.inicio)}
                    </p>
                    <PostStatusBadge estado={event.estado} />
                  </div>
                  <Link
                    to={`/eventos/${event.id}/editar`}
                    state={{ event }}
                    className="text-sm font-bold text-franja-morada"
                  >
                    Editar
                  </Link>
                </article>
              ))}
            </div>

            <AdminPostsPagination
              page={page}
              pages={pages}
              from={from}
              to={to}
              total={total}
              entityLabel="eventos"
              onPageChange={goToPage}
            />
          </div>
        ) : null}
      </main>
    </AdminLayout>
  );
}
