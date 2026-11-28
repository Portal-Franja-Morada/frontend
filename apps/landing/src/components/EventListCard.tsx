import type { EventListItem } from "../types/view";
import { OptimizedImage } from "./OptimizedImage";

type EventListCardProps = {
  event: EventListItem;
};

export function EventListCard({ event }: EventListCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-franja-border bg-white">
      <OptimizedImage
        src={event.image}
        alt={event.imageAlt}
        layout="card"
        className="aspect-[409/200] h-[190px] w-full object-cover lg:h-[200px]"
      />
      <div className="flex min-h-[200px] flex-col gap-[18px] p-6">
        <div className="flex flex-col items-center self-start rounded-lg bg-franja-rose px-3 py-3">
          <span className="text-section leading-section font-bold text-franja-morada">
            {event.day}
          </span>
          <span className="text-xs font-bold text-franja-morada">
            {event.monthYear}
          </span>
        </div>

        <h2 className="text-card-title font-bold text-franja-dark">
          {event.title}
        </h2>

        <div className="text-base text-franja-muted">
          <p>{event.time}</p>
          <p>{event.location}</p>
        </div>

        <a
          href={event.href}
          className="mt-auto text-sm font-bold text-franja-morada transition-opacity hover:opacity-80"
        >
          Conocé el evento →
        </a>
      </div>
    </article>
  );
}
