import { DEFAULT_NEWS_IMAGE } from "../lib/constants";
import {
  formatEventDay,
  formatEventMonth,
  formatEventPreviewMeta,
} from "../lib/dates";
import { argentinaLocalToIso } from "../lib/event-datetime";

type EventEditorPreviewProps = {
  titulo: string;
  lugar: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  descripcion: string;
  imagenUrl: string | null;
};

export function EventEditorPreview({
  titulo,
  lugar,
  fecha,
  horaInicio,
  horaFin,
  descripcion,
  imagenUrl,
}: EventEditorPreviewProps) {
  const title = titulo.trim() || "Título del evento";
  const place = lugar.trim() || "Lugar del evento";
  const inicioIso =
    fecha && horaInicio ? argentinaLocalToIso(fecha, horaInicio) : null;
  const meta = formatEventPreviewMeta(fecha, horaInicio);
  const day = inicioIso ? formatEventDay(inicioIso) : "—";
  const monthYear = inicioIso
    ? `${formatEventMonth(inicioIso)} ${fecha.split("-")[0] ?? ""}`
    : "—";

  return (
    <aside className="flex flex-col gap-4">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-muted">
        Vista previa
      </p>
      <article className="flex flex-col overflow-hidden rounded-xl border border-franja-border bg-white">
        <img
          src={imagenUrl ?? DEFAULT_NEWS_IMAGE}
          alt=""
          className="h-[160px] w-full object-cover"
          width={409}
          height={160}
        />
        <div className="flex min-h-[200px] flex-col gap-[18px] p-6">
          <div className="flex flex-col items-center self-start rounded-lg bg-franja-rose px-3 py-3">
            <span className="text-section leading-section font-bold text-franja-morada">
              {day}
            </span>
            <span className="text-xs font-bold text-franja-morada">
              {monthYear}
            </span>
          </div>
          <p className="text-xs font-bold text-franja-morada">{meta}</p>
          <h3 className="text-card-title font-bold text-franja-dark">
            {title}
          </h3>
          <div className="text-base text-franja-muted">
            <p>
              {horaFin
                ? `${horaInicio} a ${horaFin} h`
                : horaInicio
                  ? `${horaInicio} h`
                  : "Horario"}
            </p>
            <p>{place}</p>
          </div>
          {descripcion.trim() ? (
            <p className="text-[13px] text-franja-muted line-clamp-3">
              {descripcion.trim()}
            </p>
          ) : null}
          <span className="mt-auto text-sm font-bold text-franja-morada">
            Conocé el evento →
          </span>
        </div>
      </article>
      <p className="text-[13px] text-franja-muted">
        Así se verá la publicación. No es visible hasta que confirmes.
      </p>
    </aside>
  );
}
