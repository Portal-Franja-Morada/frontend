import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { useState } from "react";
import { useEventDetail } from "../hooks/use-event-detail";
import { CalendarConfirmBanner } from "./CalendarConfirmBanner";
import { EventAgendaPanel } from "./EventAgendaPanel";
import { Footer } from "./Footer";
import { GoldCorner } from "./GoldCorner";
import { Header } from "./Header";
import { PostMarkdown } from "./PostMarkdown";

export function EventDetailPage() {
  const { event, dataState, retry } = useEventDetail();
  const [showCalendarBanner, setShowCalendarBanner] = useState(false);

  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/eventos";
  const breadcrumbTitle = event?.title ?? null;

  return (
    <>
      <Header currentPath={currentPath} />
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
              <a
                href="/eventos"
                className="transition-opacity hover:opacity-80"
              >
                Eventos
              </a>
              {breadcrumbTitle ? (
                <>
                  <span aria-hidden="true"> / </span>
                  <span>{breadcrumbTitle}</span>
                </>
              ) : null}
            </nav>

            {event ? (
              <h1 className="text-[26px] leading-[34px] font-bold text-white uppercase lg:text-[36px] lg:leading-[44px]">
                {event.title}
              </h1>
            ) : null}

            <GoldCorner />
          </div>
        </div>

        <div className="px-5 py-6 lg:px-20 lg:py-16">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10">
            {dataState === "cargando" ? <LoadingState /> : null}
            {dataState === "vacio" ? (
              <EmptyState message="Este evento ya no está disponible." />
            ) : null}
            {dataState === "error" ? <ErrorState onRetry={retry} /> : null}

            {dataState === "ok" && event ? (
              <>
                {showCalendarBanner ? <CalendarConfirmBanner /> : null}

                <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
                  <article className="flex w-full flex-col gap-6 lg:max-w-[880px]">
                    <img
                      src={event.image}
                      alt={event.imageAlt}
                      className="h-[220px] w-full rounded-xl object-cover lg:h-[340px]"
                      width={880}
                      height={340}
                    />

                    <PostMarkdown content={event.description} />
                  </article>

                  <EventAgendaPanel
                    event={event}
                    onCalendarClick={() => setShowCalendarBanner(true)}
                  />
                </div>

                <a
                  href="/eventos"
                  className="text-sm font-bold text-franja-morada transition-opacity hover:opacity-80"
                >
                  ← Volver a eventos
                </a>
              </>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
