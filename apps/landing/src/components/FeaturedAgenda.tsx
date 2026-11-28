import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import type { DataState } from "../lib/data-state";
import type { AgendaEvent } from "../types/view";
import { GoldCorner } from "./GoldCorner";
import { OptimizedImage } from "./OptimizedImage";
import { Section } from "./Section";

type FeaturedAgendaProps = {
  dataState: DataState;
  events: AgendaEvent[];
  onRetry: () => void;
};

function EventDate({ day, month }: Pick<AgendaEvent, "day" | "month">) {
  return (
    <div className="flex min-w-[72px] flex-col items-center rounded-lg bg-franja-rose px-3 py-2">
      <span className="text-section leading-section font-bold text-franja-morada">
        {day}
      </span>
      <span className="text-xs font-bold text-franja-morada">{month}</span>
    </div>
  );
}

function EventCard({ event }: { event: AgendaEvent }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-franja-border bg-white">
      <OptimizedImage
        src={event.image}
        alt={event.imageAlt}
        layout="card"
        className="aspect-[409/200] h-[160px] w-full object-cover"
      />
      <div className="flex items-start gap-4 p-5">
        <EventDate day={event.day} month={event.month} />
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-franja-dark">{event.title}</h3>
          <p className="text-[13px] text-franja-muted">
            {event.time} · {event.location}
          </p>
          <a
            href={event.href}
            className="text-[13px] text-franja-morada transition-opacity hover:opacity-80"
          >
            Ver evento →
          </a>
        </div>
      </div>
    </article>
  );
}

export function FeaturedAgenda({
  dataState,
  events,
  onRetry,
}: FeaturedAgendaProps) {
  return (
    <Section id="eventos">
      <div className="flex flex-col gap-6">
        <GoldCorner />
        <h2 className="text-section leading-section font-bold whitespace-pre-line text-franja-dark">
          NOS ENCONTRAMOS{"\n"}EN LA FACU
        </h2>
        <p className="text-base text-franja-muted">
          Charlas, talleres y actividades para compartir.
        </p>

        {dataState === "cargando" ? <LoadingState /> : null}
        {dataState === "vacio" ? (
          <EmptyState message="Todavía no hay eventos cargados" />
        ) : null}
        {dataState === "error" ? <ErrorState onRetry={onRetry} /> : null}

        {dataState === "ok" ? (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>

            <a
              href="/eventos"
              className="text-sm font-bold text-franja-morada transition-opacity hover:opacity-80"
            >
              Ver todos los eventos →
            </a>
          </>
        ) : null}
      </div>
    </Section>
  );
}
