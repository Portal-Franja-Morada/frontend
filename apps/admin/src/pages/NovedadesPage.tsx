import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { AdminPostsPagination } from "../components/AdminPostsPagination";
import { ContentActionToast } from "../components/ContentActionToast";
import { DeleteContentDialog } from "../components/DeleteContentDialog";
import { PostStatusBadge } from "../components/PostStatusBadge";
import { PostsStats } from "../components/PostsStats";
import { useAdminPostsPage } from "../hooks/use-admin-posts-page";
import { useDeleteContent } from "../hooks/use-delete-content";
import { formatAdminListDate } from "../lib/dates";

const inputClassName =
  "h-14 w-full rounded-lg border border-franja-border bg-white px-4 text-base text-franja-dark outline-none transition-colors placeholder:text-franja-muted focus:border-franja-morada";

type NovedadesLocationState = {
  deletedToast?: string;
};

export function NovedadesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    posts,
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
    refresh,
    removePost,
  } = useAdminPostsPage();

  const {
    deleteOpen,
    deleteTitulo,
    deleting,
    dialogError,
    toast,
    openDelete,
    closeDelete,
    confirmDelete,
    dismissToast,
    showToast,
  } = useDeleteContent({
    kind: "post",
    onDeleted: (id) => {
      removePost(id);
      void refresh();
    },
    onRefresh: () => {
      void refresh();
    },
  });

  useEffect(() => {
    const state = location.state as NovedadesLocationState | null;
    if (!state?.deletedToast) {
      return;
    }
    showToast(state.deletedToast);
    navigate(location.pathname + location.search, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.search, location.state, navigate, showToast]);

  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-8 px-5 py-8 lg:px-10 lg:py-10">
        <nav aria-label="Recorrido" className="text-[13px] text-franja-muted">
          Administración / Novedades
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[26px] font-bold text-franja-dark lg:text-[36px]">
              NOVEDADES
            </h1>
            <p className="mt-2 text-base text-franja-muted">
              Organizá lo que la comunidad necesita saber.
            </p>
          </div>
          <Link
            to="/novedades/nueva"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-franja-morada px-5 text-sm font-bold text-white transition-colors hover:bg-franja-morada/90"
          >
            + Crear novedad
          </Link>
        </div>

        <PostsStats stats={stats} />

        <div className="flex flex-col gap-4 lg:flex-row">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar novedades…"
            className={inputClassName}
            aria-label="Buscar novedades"
          />
          <label className="sr-only" htmlFor="estado-filter">
            Filtrar por estado
          </label>
          <select
            id="estado-filter"
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
          <EmptyState message="Todavía no hay novedades cargadas" />
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
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-b border-franja-border last:border-b-0"
                    >
                      <td className="px-5 py-4 text-sm font-bold text-franja-dark">
                        {post.titulo}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-franja-muted">
                        {formatAdminListDate(post.updatedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <PostStatusBadge estado={post.estado} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            to={`/novedades/${post.id}/editar`}
                            state={{ post }}
                            className="text-sm font-bold text-franja-morada"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() => openDelete(post.id, post.titulo)}
                            className="text-sm font-bold text-franja-error disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 lg:hidden">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col gap-3 rounded-[10px] border border-franja-border bg-white p-5"
                >
                  <p className="text-sm font-bold text-franja-dark">
                    {post.titulo}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] text-franja-muted">
                      {formatAdminListDate(post.updatedAt)}
                    </p>
                    <PostStatusBadge estado={post.estado} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/novedades/${post.id}/editar`}
                      state={{ post }}
                      className="text-sm font-bold text-franja-morada"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => openDelete(post.id, post.titulo)}
                      className="text-sm font-bold text-franja-error disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <AdminPostsPagination
              page={page}
              pages={pages}
              from={from}
              to={to}
              total={total}
              onPageChange={goToPage}
            />
          </div>
        ) : null}
      </main>

      {deleteOpen ? (
        <DeleteContentDialog
          titulo={deleteTitulo}
          busy={deleting}
          error={dialogError}
          onCancel={closeDelete}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}

      {toast ? (
        <ContentActionToast message={toast} onDismiss={dismissToast} />
      ) : null}
    </AdminLayout>
  );
}
