import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { usePostsPage } from "../hooks/use-posts-page";
import { Footer } from "./Footer";
import { GoldCorner } from "./GoldCorner";
import { Header } from "./Header";
import { NewsCard } from "./NewsCard";
import { NewsPagination } from "./NewsPagination";

export function NewsListPage() {
  const { news, dataState, page, total, pages, from, to, pageNumbers, retry } =
    usePostsPage();

  return (
    <>
      <Header currentPath="/novedades" />
      <main>
        <div className="bg-franja-morada px-5 py-6 lg:px-20 lg:py-16">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
            <nav
              aria-label="Recorrido"
              className="text-[13px] font-normal text-white"
            >
              <a href="/" className="transition-opacity hover:opacity-80">
                Inicio
              </a>
              <span aria-hidden="true"> / </span>
              <span>Novedades</span>
            </nav>

            <h1 className="text-[26px] leading-[34px] font-bold text-white lg:text-[36px] lg:leading-[44px]">
              NOVEDADES
            </h1>

            <GoldCorner />
          </div>
        </div>

        <div className="px-5 py-6 lg:px-20 lg:py-16">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
            <p className="text-base font-normal text-franja-muted">
              Enterate de lo que pasa en Económicas.
            </p>

            {dataState === "cargando" ? <LoadingState /> : null}
            {dataState === "vacio" ? (
              <EmptyState message="Todavía no hay novedades cargadas" />
            ) : null}
            {dataState === "error" ? <ErrorState onRetry={retry} /> : null}

            {dataState === "ok" ? (
              <>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {news.map((item) => (
                    <NewsCard key={item.slug} item={item} titleTag="h2" />
                  ))}
                </div>

                <NewsPagination
                  page={page}
                  total={total}
                  pages={pages}
                  from={from}
                  to={to}
                  pageNumbers={pageNumbers}
                />
              </>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
