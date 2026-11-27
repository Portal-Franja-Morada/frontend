import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { StudentLayout } from "../components/StudentLayout";
import { SubjectDetailSheet } from "../components/SubjectDetailSheet";
import {
  VerificationImportGate,
  verificationImportVariant,
} from "../components/VerificationImportGate";
import { useAuth } from "../hooks/use-auth";
import { useMapaCurricularPage } from "../hooks/use-mapa-curricular-page";
import { careerLabel } from "../lib/careers";
import {
  cuatrimestreLabel,
  estadoLabel,
  estadoPillClass,
  estadoStripeClass,
  formatPromedio,
  historyPillClass,
  isSlot,
  mapaActionPillClass,
  menuCodigo,
  opcionesDelMenu,
} from "../lib/materia-display";
import type {
  EstadoMapaItem,
  EstadoMateria,
  MateriaPlan,
} from "../types/curriculum";

const legendEstados: EstadoMateria[] = [
  "aprobada",
  "regular",
  "cursando",
  "libre",
];

export function MapaCurricularPage() {
  const { user } = useAuth();
  const vm = useMapaCurricularPage(user);
  const verificationGate = verificationImportVariant(user);
  const [careerMenuOpen, setCareerMenuOpen] = useState(false);

  return (
    <StudentLayout>
      <section className="bg-franja-morada px-5 py-14 text-white lg:px-10 lg:py-16">
        <div className="w-full">
          <p className="text-[13px] text-white/90">
            Inicio / Mi carrera / Mapa curricular
          </p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            MI CARRERA.
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
              message="No pudimos cargar tu mapa curricular. Probá de nuevo en unos segundos."
              onRetry={() => void vm.retry()}
            />
          ) : vm.phase === "sin-carrera" ? (
            <SinCarreraCard
              showUnverified={vm.showUnverified}
              verificationGate={verificationGate}
              user={user}
            />
          ) : vm.phase === "sin-plan" ? (
            <SinPlanCard
              showUnverified={vm.showUnverified}
              verificationGate={verificationGate}
              user={user}
            />
          ) : vm.phase === "elegir-carrera" ? (
            <ElegirCarreraCard
              careers={vm.careers}
              onSelect={vm.selectCareer}
            />
          ) : vm.data ? (
            <MapaContent
              data={vm.data}
              careers={vm.careers}
              activeSlug={vm.activeCareer?.slug ?? null}
              careerMenuOpen={careerMenuOpen}
              showDemoBadge={Boolean(import.meta.env.DEV && vm.devState)}
              onToggleMenu={() => setCareerMenuOpen((v) => !v)}
              onSelectCareer={vm.selectCareer}
              verificationGate={verificationGate}
              user={user}
              onSelectMateria={vm.setSelectedMateria}
            />
          ) : (
            <LoadingState />
          )}
        </div>
      </section>

      {vm.selectedMateria && vm.data ? (
        <SubjectDetailSheet
          materia={vm.selectedMateria}
          mapa={vm.data.mapa}
          plan={vm.data.plan}
          onClose={() => vm.setSelectedMateria(null)}
        />
      ) : null}
    </StudentLayout>
  );
}

function SinCarreraCard({
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
        Todavía no cargaste tu carrera
      </h2>
      <p className="mt-2 text-base text-franja-muted">
        Subí el PDF de tu plan del SIU para ver tu mapa curricular.
      </p>
      {showUnverified && verificationGate ? (
        <VerificationImportGate variant={verificationGate} user={user} />
      ) : (
        <Link
          to="/importar-siu"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white"
        >
          Subir mi plan
        </Link>
      )}
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
        Subí tu plan de estudios
      </h2>
      <p className="mt-2 text-base text-franja-muted">
        Necesitamos saber tu plan para armar el mapa.
      </p>
      {showUnverified && verificationGate ? (
        <VerificationImportGate variant={verificationGate} user={user} />
      ) : (
        <Link
          to="/importar-siu"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white"
        >
          Subir mi plan
        </Link>
      )}
    </div>
  );
}

function ElegirCarreraCard({
  careers,
  onSelect,
}: {
  careers: { slug: string; nombre: string; anioPlan: number | null }[];
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <h2 className="text-xl font-bold text-franja-dark">
        ¿Qué carrera querés ver?
      </h2>
      <ul className="mt-6 space-y-3">
        {careers.map((c) => (
          <li key={c.slug}>
            <button
              type="button"
              onClick={() => onSelect(c.slug)}
              className="flex w-full items-center justify-between rounded-lg border border-franja-border bg-white px-5 py-4 text-left text-base font-bold text-franja-dark"
            >
              {c.nombre}
              <span className="text-sm font-bold text-franja-morada">
                Ver mapa
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MapaContent({
  data,
  careers,
  activeSlug,
  careerMenuOpen,
  showDemoBadge,
  onToggleMenu,
  onSelectCareer,
  verificationGate,
  user,
  onSelectMateria,
}: {
  data: NonNullable<ReturnType<typeof useMapaCurricularPage>["data"]>;
  careers: { slug: string; nombre: string; anioPlan: number | null }[];
  activeSlug: string | null;
  careerMenuOpen: boolean;
  showDemoBadge: boolean;
  onToggleMenu: () => void;
  onSelectCareer: (slug: string) => void;
  verificationGate: ReturnType<typeof verificationImportVariant>;
  user: Parameters<typeof VerificationImportGate>[0]["user"];
  onSelectMateria: (m: MateriaPlan) => void;
}) {
  const materias = data.plan.materias;
  const { aprobadas, total, porcentaje } = data.avance.materias;
  const multipleCareers = careers.filter((c) => c.anioPlan).length > 1;
  const yearGroups = buildYearGroups(materias);

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
              {careerLabel(data.plan.carrera)} · Plan {data.plan.anio_plan}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {multipleCareers ? (
              <div className="relative">
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

            {!verificationGate ? (
              <Link
                to="/importar-siu"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada"
              >
                Importar PDF del SIU
              </Link>
            ) : null}
          </div>
        </div>

        {verificationGate ? (
          <div className="mt-6">
            <VerificationImportGate variant={verificationGate} user={user} />
          </div>
        ) : null}

        <div className="mt-6">
          <p className="text-base font-bold text-franja-dark">
            {aprobadas} de {total} materias ({porcentaje}%)
          </p>
          <div
            className="mt-3 h-2.5 w-full max-w-xl overflow-hidden rounded-md bg-[#E7DFE2]"
            role="progressbar"
            aria-valuenow={porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Avance en materias"
          >
            <div
              className="h-full rounded-md bg-franja-morada transition-[width]"
              style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
            />
          </div>
          {data.avance.creditos ? (
            <p className="mt-2 text-sm text-franja-muted">
              {data.avance.creditos.aprobadas} de {data.avance.creditos.total}{" "}
              créditos ({data.avance.creditos.porcentaje}%)
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <PromedioStat
            label="Promedio con aplazos"
            value={formatPromedio(data.promedios.conAplazos)}
          />
          <PromedioStat
            label="Promedio sin aplazos"
            value={formatPromedio(data.promedios.sinAplazos)}
          />
        </div>

        <Legend className="mt-6" />
      </div>

      <div className="space-y-8">
        {yearGroups.map((group) => (
          <YearSection
            key={group.key}
            group={group}
            mapa={data.mapa}
            onSelectMateria={onSelectMateria}
          />
        ))}
      </div>
    </div>
  );
}

function PromedioStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[13px] text-franja-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-franja-dark">{value}</p>
    </div>
  );
}

function Legend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {legendEstados.map((estado) => (
        <span
          key={estado}
          className={cn(historyPillClass, estadoPillClass(estado))}
        >
          {estadoLabel(estado)}
        </span>
      ))}
      <span className={cn(historyPillClass, estadoPillClass(null))}>
        SIN HACER
      </span>
    </div>
  );
}

type YearGroup = {
  key: string;
  title: string;
  anio: number;
  materias: MateriaPlan[];
  optativas?: { title: string; subtitulo?: string; opciones: MateriaPlan[] };
};

function buildYearGroups(materias: MateriaPlan[]): YearGroup[] {
  const roots = materias.filter((m) => !m.opcionDe && !isSlot(m, materias));
  const slots = materias.filter((m) => isSlot(m, materias));
  const years = [...new Set(roots.map((m) => m.anio))].sort((a, b) => a - b);
  const groups: YearGroup[] = years.map((anio) => ({
    key: `anio-${anio}`,
    title: `${anio}° AÑO`,
    anio,
    materias: roots
      .filter((m) => m.anio === anio)
      .sort((a, b) => a.codigo.localeCompare(b.codigo)),
  }));

  for (const slot of slots) {
    const menu = menuCodigo(slot);
    const opciones = opcionesDelMenu(menu, materias);
    let group = groups.find((g) => g.anio === slot.anio);
    if (!group) {
      group = {
        key: `anio-${slot.anio}`,
        title: `${slot.anio}° AÑO`,
        anio: slot.anio,
        materias: [],
      };
      groups.push(group);
    }
    group.optativas = {
      title: opciones.length > 0 ? "Optativa · elegí 1" : slot.nombre,
      subtitulo: `${slot.anio}° año · sin hacer`,
      opciones,
    };
  }

  groups.sort((a, b) => a.anio - b.anio);
  return groups;
}

function YearSection({
  group,
  mapa,
  onSelectMateria,
}: {
  group: YearGroup;
  mapa: Record<string, EstadoMapaItem>;
  onSelectMateria: (m: MateriaPlan) => void;
}) {
  const todasSinHacer =
    group.optativas?.opciones.every((m) => mapa[m.codigo]?.estado == null) ??
    false;

  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        {group.title}
      </h2>
      {group.materias.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {group.materias.map((m) => (
            <SubjectCard
              key={m.codigo}
              materia={m}
              item={mapa[m.codigo]}
              onSelect={() => onSelectMateria(m)}
            />
          ))}
        </div>
      ) : null}

      {group.optativas ? (
        <div className={cn(group.materias.length > 0 && "mt-6")}>
          <p className="text-sm font-bold text-franja-dark">
            {group.optativas.title}
          </p>
          {todasSinHacer && group.optativas.subtitulo ? (
            <p className="mt-1 text-sm text-franja-muted">
              {group.optativas.subtitulo}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {group.optativas.opciones.map((m) => (
              <button
                key={m.codigo}
                type="button"
                onClick={() => onSelectMateria(m)}
                className={cn(
                  historyPillClass,
                  "bg-[#FAF8F6] text-franja-dark hover:bg-franja-surface",
                )}
              >
                {m.nombre}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SubjectCard({
  materia,
  item,
  onSelect,
}: {
  materia: MateriaPlan;
  item: EstadoMapaItem | undefined;
  onSelect: () => void;
}) {
  const cuat = cuatrimestreLabel(materia.cuatrimestre);
  const estado = item?.estado ?? null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-[114px] w-full overflow-hidden rounded-[10px] border border-franja-border bg-white text-left transition hover:border-franja-morada"
    >
      <div
        className={cn("w-1 shrink-0", estadoStripeClass(estado))}
        aria-hidden
      />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-base font-bold text-franja-dark">{materia.nombre}</p>
        {cuat ? <p className="mt-1 text-sm text-franja-muted">{cuat}</p> : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <span className={cn(historyPillClass, estadoPillClass(estado))}>
            {estadoLabel(estado)}
          </span>
          {item?.puedeCursar ? (
            <span className={cn(historyPillClass, mapaActionPillClass)}>
              PODÉS CURSAR
            </span>
          ) : null}
          {item?.puedeRendir ? (
            <span className={cn(historyPillClass, mapaActionPillClass)}>
              PODÉS RENDIR
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
