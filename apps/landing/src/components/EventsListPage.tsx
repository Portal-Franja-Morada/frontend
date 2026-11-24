import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { useEventsPage } from "../hooks/use-events-page";
import { EventListCard } from "./EventListCard";
import { EventsDateFilter } from "./EventsDateFilter";
import { EventsPagination } from "./EventsPagination";
import { Footer } from "./Footer";
import { GoldCorner } from "./GoldCorner";
import { Header } from "./Header";

export function EventsListPage() {
  const {
    events,
    dataState,
    page,
    total,
    pages,
    from,
    to,
    pageNumbers,
    periodLabel,
    retry,
  } = useEventsPage();

  return (
    <>
      <Header currentPath="/eventos" />
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
              <span>Eventos</span>
            </nav>

            <h1 className="text-[26px] leading-[34px] font-bold text-white lg:text-[36px] lg:leading-[44px]">
              EVENTOS
            </h1>

            <GoldCorner />
          </div>
        </div>

        <div className="px-5 py-6 lg:px-20 lg:py-16">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
            <p className="text-base font-normal text-franja-muted">
              Hagamos comunidad, dentro y fuera del aula.
            </p>

            {dataState === "ok" ? (
              <EventsDateFilter periodLabel={periodLabel} />
            ) : null}

            {dataState === "cargando" ? <LoadingState /> : null}
            {dataState === "vacio" ? (
              <EmptyState message="Todavía no hay eventos cargados" />
            ) : null}
            {dataState === "error" ? <ErrorState onRetry={retry} /> : null}

            {dataState === "ok" ? (
              <>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {events.map((event) => (
                    <EventListCard key={event.slug} event={event} />
                  ))}
                </div>

                <EventsPagination
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
