import type { CurriculumMapResponse, MateriaPlan } from "../types/curriculum";
import {
  anioLabel,
  cuatrimestreLabel,
  estadoBadgeClass,
  estadoLabel,
  faltanteItem,
} from "../lib/materia-display";

export function SubjectDetailSheet({
  materia,
  mapa,
  plan,
  onClose,
}: {
  materia: MateriaPlan;
  mapa: CurriculumMapResponse["mapa"];
  plan: CurriculumMapResponse["plan"];
  onClose: () => void;
}) {
  const item = mapa[materia.codigo];
  if (!item) return null;

  const cuat = cuatrimestreLabel(materia.cuatrimestre);
  const subtitulo = [anioLabel(materia.anio), cuat].filter(Boolean).join(" · ");

  const faltanCursar = item.faltanCursar.map((c) =>
    faltanteItem(c, "cursar", plan.materias),
  );
  const faltanRendir = item.faltanRendir.map((c) =>
    faltanteItem(c, "rendir", plan.materias),
  );
  const reglas = [...item.faltanReglas, ...item.requisitosExtra];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 lg:items-center lg:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="materia-detalle-titulo"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl lg:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="materia-detalle-titulo"
              className="text-xl font-bold text-franja-dark"
            >
              {materia.nombre}
            </h2>
            <p className="mt-1 text-sm text-franja-muted">{subtitulo}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-lg font-bold text-franja-morada"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wide ${estadoBadgeClass(item.estado)}`}
          >
            {estadoLabel(item.estado)}
          </span>
          {item.puedeCursar ? (
            <span className="text-xs font-bold uppercase tracking-wide text-franja-morada">
              Podés cursar
            </span>
          ) : null}
          {item.puedeRendir ? (
            <span className="text-xs font-bold uppercase tracking-wide text-franja-morada">
              Podés rendir
            </span>
          ) : null}
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm font-bold text-franja-dark">
              Para cursar te falta:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-franja-muted">
              {faltanCursar.length === 0 ? (
                <li>Nada: ya podés cursarla.</li>
              ) : (
                faltanCursar.map((t) => <li key={t}>{t}</li>)
              )}
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-franja-dark">
              Para rendir te falta:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-franja-muted">
              {faltanRendir.length === 0 ? (
                <li>Nada: ya podés rendirla.</li>
              ) : (
                faltanRendir.map((t) => (
                  <li key={t}>
                    {item.estado === "regular" && t.includes(materia.nombre)
                      ? `Regularizar ${materia.nombre}`
                      : t}
                  </li>
                ))
              )}
            </ul>
          </div>
          {reglas.length > 0 ? (
            <div>
              <p className="text-sm font-bold text-franja-dark">
                Reglas especiales
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-franja-muted">
                {reglas.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
