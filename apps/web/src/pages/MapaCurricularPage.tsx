import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { StudentFooter } from "../components/StudentFooter";
import { StudentHeader } from "../components/StudentHeader";
import { SubjectDetailSheet } from "../components/SubjectDetailSheet";
import {
  VerificationImportGate,
  verificationImportVariant,
} from "../components/VerificationImportGate";
import { useAuth } from "../hooks/use-auth";
import { useMapaCurricularPage } from "../hooks/use-mapa-curricular-page";
import {
  cuatrimestreLabel,
  estadoBadgeClass,
  estadoLabel,
  formatPromedio,
  isSlot,
  menuCodigo,
  opcionesDelMenu,
} from "../lib/materia-display";
import type { EstadoMapaItem, MateriaPlan } from "../types/curriculum";

export function MapaCurricularPage() {
  const { user } = useAuth();
  const vm = useMapaCurricularPage(user);
  const verificationGate = verificationImportVariant(user);
  const [careerMenuOpen, setCareerMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StudentHeader currentPath="/mi-carrera" />

      <section className="bg-franja-morada px-5 py-14 text-white lg:px-20 lg:py-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="text-[13px] text-white/90">Inicio / Mi carrera</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            MI CARRERA.
          </h1>
          {vm.careerTitle && vm.phase === "mapa" ? (
            <p className="mt-3 text-base text-white/90">{vm.careerTitle}</p>
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

      <StudentFooter />
    </div>
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
  onToggleMenu: () => void;
  onSelectCareer: (slug: string) => void;
  verificationGate: ReturnType<typeof verificationImportVariant>;
  user: Parameters<typeof VerificationImportGate>[0]["user"];
  onSelectMateria: (m: MateriaPlan) => void;
}) {
  const materias = data.plan.materias;
  const { aprobadas, total, porcentaje } = data.avance.materias;
  const multipleCareers = careers.length > 1;

  const yearGroups = buildYearGroups(materias);

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

        {verificationGate ? (
          <VerificationImportGate variant={verificationGate} user={user} />
        ) : null}

        <p className="mt-6 text-base font-bold text-franja-dark">
          {aprobadas} de {total} materias ({porcentaje}%)
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Stat
            label="Promedio con aplazos"
            value={formatPromedio(data.promedios.conAplazos)}
          />
          <Stat
            label="Promedio sin aplazos"
            value={formatPromedio(data.promedios.sinAplazos)}
          />
        </div>

        <Legend className="mt-6" />
      </div>

      <div className="space-y-10">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-franja-border p-4">
      <p className="text-sm text-franja-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-franja-dark">{value}</p>
    </div>
  );
}

function Legend({ className }: { className?: string }) {
  const items = ["APROBADA", "REGULAR", "CURSANDO", "LIBRE", "SIN HACER"];
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {items.map((l) => (
        <span
          key={l}
          className="text-[11px] font-bold uppercase tracking-wide text-franja-muted"
        >
          {l}
        </span>
      ))}
    </div>
  );
}

type YearGroup = {
  key: string;
  title: string;
  materias: MateriaPlan[];
  optativas?: { title: string; opciones: MateriaPlan[] };
};

function buildYearGroups(materias: MateriaPlan[]): YearGroup[] {
  const roots = materias.filter((m) => !m.opcionDe && !isSlot(m, materias));
  const slots = materias.filter((m) => isSlot(m, materias));
  const years = [...new Set(roots.map((m) => m.anio))].sort((a, b) => a - b);
  const groups: YearGroup[] = [];

  for (const anio of years) {
    const delAnio = roots
      .filter((m) => m.anio === anio)
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
    groups.push({
      key: `anio-${anio}`,
      title: `${anio}° AÑO`,
      materias: delAnio,
    });
  }

  for (const slot of slots) {
    const menu = menuCodigo(slot);
    const opciones = opcionesDelMenu(menu, materias);
    const title = opciones.length > 0 ? `Optativa · elegí 1` : slot.nombre;
    groups.push({
      key: `slot-${slot.codigo}`,
      title: `${slot.anio}° AÑO`,
      materias: [],
      optativas: { title, opciones },
    });
  }

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
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        {group.title}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {group.materias.map((m) => (
          <SubjectCard
            key={m.codigo}
            materia={m}
            item={mapa[m.codigo]}
            onSelect={() => onSelectMateria(m)}
          />
        ))}
        {group.optativas ? (
          <>
            <p className="sm:col-span-2 lg:col-span-3 text-sm font-bold text-franja-muted">
              {group.optativas.title}
            </p>
            {group.optativas.opciones.map((m) => (
              <SubjectCard
                key={m.codigo}
                materia={m}
                item={mapa[m.codigo]}
                onSelect={() => onSelectMateria(m)}
              />
            ))}
          </>
        ) : null}
      </div>
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
      className="rounded-lg border border-franja-border bg-white p-4 text-left shadow-sm transition hover:border-franja-morada"
    >
      <p className="text-base font-bold text-franja-dark">{materia.nombre}</p>
      {cuat ? <p className="mt-1 text-sm text-franja-muted">{cuat}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-wide",
            estadoBadgeClass(estado),
          )}
        >
          {estadoLabel(estado)}
        </span>
        {item?.puedeCursar ? (
          <span className="text-[11px] font-bold uppercase tracking-wide text-franja-morada">
            Podés cursar
          </span>
        ) : null}
        {item?.puedeRendir ? (
          <span className="text-[11px] font-bold uppercase tracking-wide text-franja-morada">
            Podés rendir
          </span>
        ) : null}
      </div>
    </button>
  );
}
