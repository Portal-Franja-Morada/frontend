import { cn } from "@franja/ui/lib/utils";
import { useState } from "react";
import type {
  AcademicHistoryPatchBody,
  AcademicRecordItem,
  EstadoMateria,
} from "../types/academic-history";

const ESTADOS: { value: EstadoMateria; label: string }[] = [
  { value: "aprobada", label: "Aprobada" },
  { value: "regular", label: "Regular" },
  { value: "cursando", label: "Cursando" },
  { value: "libre", label: "Libre" },
];

export function EditRecordDialog({
  record,
  saving,
  onSave,
  onCancel,
}: {
  record: AcademicRecordItem;
  saving: boolean;
  onSave: (body: AcademicHistoryPatchBody) => void;
  onCancel: () => void;
}) {
  const [estado, setEstado] = useState<EstadoMateria>(record.estado);
  const [nota, setNota] = useState(record.nota?.toString() ?? "");
  const [aplazos, setAplazos] = useState<number[]>(record.aplazos);

  const parsedNota = nota.trim() === "" ? null : Number(nota);

  const handleSave = () => {
    const body: AcademicHistoryPatchBody = { estado };
    if (nota.trim() === "") body.nota = null;
    else if (!Number.isNaN(parsedNota)) body.nota = parsedNota;
    body.aplazos = aplazos;
    onSave(body);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 lg:items-center lg:p-6"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-labelledby="edit-record-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl lg:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="edit-record-title"
              className="text-xl font-bold text-franja-dark"
            >
              Editar {record.nombre}
            </h2>
            <p className="mt-1 text-sm text-franja-muted">
              {record.codigo} · importada del SIU
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-lg font-bold text-franja-morada"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <p className="text-sm font-bold text-franja-dark">Estado</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ESTADOS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEstado(opt.value)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-bold",
                    estado === opt.value
                      ? "border-franja-morada bg-franja-morada text-white"
                      : "border-franja-border text-franja-dark",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="nota"
              className="text-sm font-bold text-franja-dark"
            >
              Nota
            </label>
            <input
              id="nota"
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="mt-2 w-full rounded-lg border border-franja-border px-4 py-3 text-base"
            />
            <p className="mt-1 text-[13px] text-franja-muted">
              De 0 a 10, o vacía.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-franja-dark">Aplazos</p>
            <div className="mt-2 space-y-2">
              {aplazos.map((n, i) => (
                <div key={`${n}-${i}`} className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={n}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (Number.isNaN(val)) return;
                      setAplazos((prev) =>
                        prev.map((x, j) => (j === i ? val : x)),
                      );
                    }}
                    className="w-24 rounded-lg border border-franja-border px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAplazos((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="text-sm font-bold text-franja-morada"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAplazos((prev) => [...prev, 2])}
                className="text-sm font-bold text-franja-morada"
              >
                + Agregar nota
              </button>
            </div>
            <p className="mt-1 text-[13px] text-franja-muted">
              Cada aplazo es una nota.
            </p>
          </div>

          <p className="text-[13px] text-franja-muted">
            Solo podés editar materias importadas.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex h-12 flex-1 items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white disabled:opacity-60"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-12 flex-1 items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
