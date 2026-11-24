import { cn } from "@franja/ui/lib/utils";
import { useCallback, useState } from "react";
import type { EventDetailView } from "../hooks/use-event-detail";

type EventAgendaPanelProps = {
  event: EventDetailView;
  onCalendarClick: () => void;
};

function AgendaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-franja-muted">{label}</p>
      <p className="text-base leading-[26px] font-normal text-franja-dark">
        {value}
      </p>
    </div>
  );
}

export function EventAgendaPanel({
  event,
  onCalendarClick,
}: EventAgendaPanelProps) {
  const [shareMessage, setShareMessage] = useState("");

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, url });
        setShareMessage("");
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareMessage("Enlace copiado al portapapeles.");
      window.setTimeout(() => setShareMessage(""), 3000);
    } catch {
      setShareMessage("");
    }
  }, [event.title]);

  const showCalendarLink = event.googleCalendarUrl.trim().length > 0;

  return (
    <aside className="flex w-full flex-col gap-5 rounded-xl bg-franja-surface p-6 lg:w-[360px] lg:shrink-0">
      <h2 className="text-card-title font-bold text-franja-dark">
        Agendá el encuentro
      </h2>

      <AgendaField label="FECHA" value={event.dateLabel} />
      <AgendaField label="HORARIO" value={event.timeLabel} />
      <AgendaField label="LUGAR" value={event.location} />

      {showCalendarLink ? (
        <a
          href={event.googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCalendarClick}
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-franja-morada px-5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Agregar a mi calendario
        </a>
      ) : null}

      <button
        type="button"
        onClick={() => void handleShare()}
        className={cn(
          "inline-flex h-[50px] w-full items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada transition-opacity hover:opacity-90",
        )}
      >
        Compartir evento
      </button>

      {shareMessage ? (
        <p
          className="text-[13px] text-franja-muted"
          role="status"
          aria-live="polite"
        >
          {shareMessage}
        </p>
      ) : null}
    </aside>
  );
}
