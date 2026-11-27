import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DeleteImportDialog } from "../components/DeleteImportDialog";
import { EditRecordDialog } from "../components/EditRecordDialog";
import { StudentLayout } from "../components/StudentLayout";
import {
  VerificationImportGate,
  verificationImportVariant,
} from "../components/VerificationImportGate";
import { useAuth } from "../hooks/use-auth";
import { useHistorialPage } from "../hooks/use-historial-page";
import { careerLabel } from "../lib/careers";
import { formatDateArgentina } from "../lib/dates";
import {
  estadoLabel,
  estadoPillClass,
  historyPillClass,
  origenLabel,
  origenPillClass,
} from "../lib/materia-display";
import type {
  AcademicHistoryResponse,
  AcademicRecordItem,
} from "../types/academic-history";

const thClass =
  "px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-franja-muted";

export function HistorialPage() {
  const { user } = useAuth();
  const vm = useHistorialPage(user);
  const verificationGate = verificationImportVariant(user);
  const [careerMenuOpen, setCareerMenuOpen] = useState(false);

  return (
    <StudentLayout>
      <section className="bg-franja-morada px-5 py-14 text-white lg:px-10 lg:py-16">
        <div className="w-full">
          <p className="text-[13px] text-white/90">
            Inicio / Mi carrera / Historial académico
          </p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            MI HISTORIAL ACADÉMICO.
          </h1>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-10 lg:py-14">
        <div className="w-full">
          {vm.phase === "loading" || vm.loadState === "loading" ? (
            <LoadingState />
          ) : vm.phase === "error" || vm.loadState === "error" ? (
            <ErrorState
              title="Algo no salió bien"
              message="No pudimos cargar tu historial. Probá de nuevo en unos segundos."
              onRetry={() => void vm.retry()}
            />
          ) : vm.phase === "sin-plan" ? (
            <SinPlanCard
              showUnverified={vm.showUnverified}
              verificationGate={verificationGate}
              user={user}
            />
          ) : vm.isEmpty ? (
            <VacioCard verificationGate={verificationGate} />
          ) : vm.data ? (
            <HistorialContent
              data={vm.data}
              careers={vm.careers}
              activeSlug={vm.activeCareer?.slug ?? null}
              careerMenuOpen={careerMenuOpen}
              showDemoBadge={Boolean(import.meta.env.DEV && vm.devState)}
              onToggleMenu={() => setCareerMenuOpen((v) => !v)}
              onSelectCareer={vm.selectCareer}
              verificationGate={verificationGate}
              onEdit={vm.setEditing}
              onDeleteOpen={() => vm.setDeleteOpen(true)}
            />
          ) : (
            <LoadingState />
          )}
        </div>
      </section>

      {vm.editing ? (
        <EditRecordDialog
          record={vm.editing}
          saving={vm.saving}
          onSave={(body) => void vm.saveRecord(vm.editing!.codigo, body)}
          onCancel={() => vm.setEditing(null)}
        />
      ) : null}

      <DeleteImportDialog
        open={vm.deleteOpen}
        deleting={vm.deleting}
        onConfirm={() => void vm.confirmDelete()}
        onCancel={() => vm.setDeleteOpen(false)}
      />

      {vm.savedBanner ? <SavedBanner dismiss={vm.dismissSavedBanner} /> : null}
    </StudentLayout>
  );
}

function VacioCard({
  verificationGate,
}: {
  verificationGate: ReturnType<typeof verificationImportVariant>;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <h2 className="text-xl font-bold text-franja-dark">
        Todavía no importaste tu plan
      </h2>
      {verificationGate ? (
        <p className="mt-4 text-base text-franja-muted">
          Verificá tu cuenta e importá el PDF del SIU para ver tu historial.
        </p>
      ) : null}
      <Link
        to="/importar-siu"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white"
      >
        Importar PDF del SIU
      </Link>
    </div>
  );
}

function SinPlanCard({
  showUnverified,
  verificationGate,
  user,
}: {
  showUnverified: boolean;
  verificationGate: ReturnType<typeof verificationImportVariant>;
  user: Parameters<typeof VerificationImportGate>[0]["user"];
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <h2 className="text-xl font-bold text-franja-dark">
        Subí el PDF de tu plan para ver tu historial
      </h2>
      {showUnverified && verificationGate ? (
        <VerificationImportGate variant={verificationGate} user={user} />
      ) : (
        <Link
          to="/importar-siu"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white"
        >
          Importar PDF del SIU
        </Link>
      )}
    </div>
  );
}

function HistorialContent({
  data,
  careers,
  activeSlug,
  careerMenuOpen,
  showDemoBadge,
  onToggleMenu,
  onSelectCareer,
  verificationGate,
  onEdit,
  onDeleteOpen,
}: {
  data: AcademicHistoryResponse;
  careers: { slug: string; nombre: string; anioPlan: number | null }[];
  activeSlug: string | null;
  careerMenuOpen: boolean;
  showDemoBadge: boolean;
  onToggleMenu: () => void;
  onSelectCareer: (slug: string) => void;
  verificationGate: ReturnType<typeof verificationImportVariant>;
  onEdit: (r: AcademicRecordItem) => void;
  onDeleteOpen: () => void;
}) {
  const multipleCareers = careers.filter((c) => c.anioPlan).length > 1;

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {showDemoBadge ? (
              <p className="mb-3">
                <span
                  className={cn(
                    historyPillClass,
                    "bg-[#FAF8F6] text-franja-muted",
                  )}
                >
                  DATOS DE EJEMPLO
                </span>
              </p>
            ) : null}
            <p className="text-base font-bold text-franja-dark">
              {careerLabel(data.carrera)} · Plan {data.anioPlan}
            </p>
          </div>

          {multipleCareers ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={onToggleMenu}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-franja-border bg-white px-4 text-sm font-bold text-franja-morada"
              >
                Cambiar carrera
                <span aria-hidden>{careerMenuOpen ? "▴" : "▾"}</span>
              </button>
              {careerMenuOpen ? (
                <ul className="absolute right-0 z-10 mt-2 min-w-[12rem] rounded-lg border border-franja-border bg-white p-2 shadow-sm">
                  {careers
                    .filter((c) => c.anioPlan)
                    .map((c) => (
                      <li key={c.slug}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCareer(c.slug);
                            onToggleMenu();
                          }}
                          className={cn(
                            "w-full rounded-md px-3 py-2 text-left text-sm font-bold",
                            c.slug === activeSlug
                              ? "bg-franja-surface text-franja-dark"
                              : "text-franja-morada hover:bg-franja-surface",
                          )}
                        >
                          {c.nombre}
                        </button>
                      </li>
                    ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        {data.ultimoImport ? (
          <ImportSummary
            title={`Última carga del plan: ${formatDateArgentina(data.ultimoImport.importedAt)}`}
            line={`${data.ultimoImport.resumen.importadas} aprobadas · ${data.ultimoImport.resumen.regulares} regulares · ${data.ultimoImport.resumen.cursando} cursando · ${data.ultimoImport.resumen.noReconocidas} no reconocida${data.ultimoImport.resumen.noReconocidas === 1 ? "" : "s"}`}
            advertencias={data.ultimoImport.advertencias}
          />
        ) : null}

        {data.ultimoImportHistorial ? (
          <ImportSummary
            title={`Última carga del historial: ${formatDateArgentina(data.ultimoImportHistorial.importedAt)}`}
            line={`${data.ultimoImportHistorial.resumen.aplazos} aplazos en ${data.ultimoImportHistorial.resumen.materiasConAplazos} materias · ${data.ultimoImportHistorial.resumen.fechasCompletadas} fechas completadas · ${data.ultimoImportHistorial.resumen.noReconocidas} no reconocida${data.ultimoImportHistorial.resumen.noReconocidas === 1 ? "" : "s"}`}
            advertencias={data.ultimoImportHistorial.advertencias}
          />
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {!verificationGate ? (
            <Link
              to="/importar-siu"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada"
            >
              Importar PDF
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onDeleteOpen}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-error"
          >
            Borrar lo importado del SIU
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-franja-border bg-white p-6 lg:p-8">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-franja-border">
                <th className={thClass}>Código</th>
                <th className={thClass}>Materia</th>
                <th className={thClass}>Estado</th>
                <th className={thClass}>Nota</th>
                <th className={thClass}>Aplazos</th>
                <th className={thClass}>Fecha</th>
                <th className={thClass}>Acta</th>
                <th className={thClass}>Origen</th>
                <th className={thClass}>
                  <span className="sr-only">Acción</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.registros.map((record) => (
                <RecordRow
                  key={record.codigo}
                  record={record}
                  onEdit={onEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-[13px] text-franja-muted">
        Solo podés editar materias que ya importaste del SIU. No se pueden
        agregar materias a mano.
      </p>
    </div>
  );
}

function ImportSummary({
  title,
  line,
  advertencias,
}: {
  title: string;
  line: string;
  advertencias: string[];
}) {
  return (
    <div>
      <p className="mt-6 text-sm font-bold text-franja-dark">{title}</p>
      <p className="mt-1 text-sm text-franja-muted">{line}</p>
      {advertencias.length > 0 ? (
        <p className="mt-2 text-sm text-franja-muted">
          ⚠ {advertencias.length} aviso{advertencias.length === 1 ? "" : "s"}
          {advertencias.length === 1
            ? `: “${advertencias[0]}”`
            : " para revisar."}
        </p>
      ) : null}
    </div>
  );
}

function RecordRow({
  record,
  onEdit,
}: {
  record: AcademicRecordItem;
  onEdit: (r: AcademicRecordItem) => void;
}) {
  const aplazosText =
    record.aplazos.length > 0 ? record.aplazos.join(", ") : "-";
  const notaText = record.nota !== null ? String(record.nota) : "-";
  const fechaText = record.fecha ? formatDateArgentina(record.fecha) : "-";
  const actaText = record.acta ? `Acta ${record.acta}` : "-";

  return (
    <tr className="border-b border-franja-border last:border-0">
      <td className="px-3 py-3 font-bold text-franja-dark">{record.codigo}</td>
      <td className="px-3 py-3 text-franja-dark">{record.nombre}</td>
      <td className="px-3 py-3">
        <span className={cn(historyPillClass, estadoPillClass(record.estado))}>
          {estadoLabel(record.estado)}
        </span>
      </td>
      <td className="px-3 py-3 text-franja-muted">{notaText}</td>
      <td className="px-3 py-3 text-franja-muted">{aplazosText}</td>
      <td className="px-3 py-3 text-franja-muted">{fechaText}</td>
      <td className="px-3 py-3 text-franja-muted">{actaText}</td>
      <td className="px-3 py-3">
        <span className={cn(historyPillClass, origenPillClass(record.origen))}>
          {origenLabel(record.origen)}
        </span>
      </td>
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={() => onEdit(record)}
          className="text-sm font-bold text-franja-morada"
        >
          Editar
        </button>
      </td>
    </tr>
  );
}

function SavedBanner({ dismiss }: { dismiss: () => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-40 w-[min(100%-2.5rem,28rem)] -translate-x-1/2 rounded-lg border border-franja-border bg-white p-4 shadow-lg">
      <p className="text-xs font-bold uppercase tracking-wide text-[#246448]">
        ✓ Guardamos los cambios.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-2 text-sm font-bold text-franja-morada"
      >
        Cerrar
      </button>
    </div>
  );
}
