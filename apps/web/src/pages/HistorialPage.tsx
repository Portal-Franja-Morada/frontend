import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DeleteImportDialog } from "../components/DeleteImportDialog";
import { EditRecordDialog } from "../components/EditRecordDialog";
import { StudentFooter } from "../components/StudentFooter";
import { StudentHeader } from "../components/StudentHeader";
import {
  VerificationImportGate,
  verificationImportVariant,
} from "../components/VerificationImportGate";
import { useAuth } from "../hooks/use-auth";
import { useHistorialPage } from "../hooks/use-historial-page";
import { careerLabel } from "../lib/careers";
import { formatDateArgentina } from "../lib/dates";
import { estadoBadgeClass, estadoLabel } from "../lib/materia-display";
import type {
  AcademicHistoryResponse,
  AcademicRecordItem,
} from "../types/academic-history";

export function HistorialPage() {
  const { user } = useAuth();
  const vm = useHistorialPage(user);
  const verificationGate = verificationImportVariant(user);
  const [careerMenuOpen, setCareerMenuOpen] = useState(false);

  const careerTitle = vm.activeCareer
    ? `${vm.activeCareer.nombre} · Plan ${vm.activeCareer.anioPlan}`
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StudentHeader currentPath="/historial" />

      <section className="bg-franja-morada px-5 py-14 text-white lg:px-20 lg:py-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="text-[13px] text-white/90">
            Inicio / Mi historial académico
          </p>
          <h1 className="mt-3 whitespace-pre-line text-[26px] font-bold leading-tight lg:text-[36px]">
            MI HISTORIAL{"\n"}ACADÉMICO.
          </h1>
          {careerTitle && vm.phase === "lista" && !vm.isEmpty ? (
            <p className="mt-3 text-base text-white/90">{careerTitle}</p>
          ) : null}
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-20 lg:py-14">
        <div className="mx-auto w-full max-w-[1280px]">
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

      <StudentFooter />
    </div>
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
        {multipleCareers ? (
          <div className="relative">
            <button
              type="button"
              onClick={onToggleMenu}
              className="text-sm font-bold text-franja-morada"
            >
              Cambiar carrera {careerMenuOpen ? "▴" : "▾"}
            </button>
            {careerMenuOpen ? (
              <ul className="mt-2 space-y-1">
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
                          "text-sm font-bold",
                          c.slug === activeSlug
                            ? "text-franja-dark"
                            : "text-franja-morada",
                        )}
                      >
                        {c.nombre}
                      </button>
                    </li>
                  ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="text-base font-bold text-franja-dark">
            {careerLabel(data.carrera)} · Plan {data.anioPlan}
          </p>
        )}

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

      <div className="space-y-4">
        {data.registros.map((record) => (
          <RecordCard key={record.codigo} record={record} onEdit={onEdit} />
        ))}
      </div>

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

function RecordCard({
  record,
  onEdit,
}: {
  record: AcademicRecordItem;
  onEdit: (r: AcademicRecordItem) => void;
}) {
  const aplazosText =
    record.aplazos.length > 0 ? record.aplazos.join(", ") : "—";
  const notaText = record.nota !== null ? String(record.nota) : "—";
  const fechaText = record.fecha ? formatDateArgentina(record.fecha) : "—";
  const actaText = record.acta ?? "—";

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-bold text-franja-dark">
            {record.codigo} · {record.nombre}
          </p>
          <p className="mt-1 text-sm text-franja-muted">
            Nota {notaText} · Aplazos {aplazosText} · {fechaText} · Acta{" "}
            {actaText}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-wide",
                estadoBadgeClass(record.estado),
              )}
            >
              {estadoLabel(record.estado)}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-franja-muted">
              {record.origen === "manual" ? "Editada a mano" : "SIU"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEdit(record)}
          className="shrink-0 text-sm font-bold text-franja-morada"
        >
          Editar
        </button>
      </div>
    </div>
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
