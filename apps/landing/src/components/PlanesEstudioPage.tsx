import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { usePlanesEstudioPage } from "../hooks/use-planes-estudio-page";
import {
  buildYearGroups,
  correlativasLabel,
  materiaMeta,
  planLabel,
} from "../lib/plan-display";
import type { MateriaPlan, PlanDetalle } from "../types/curriculum";
import { Footer } from "./Footer";
import { GoldCorner } from "./GoldCorner";
import { Header } from "./Header";

export function PlanesEstudioPage() {
  const vm = usePlanesEstudioPage();

  return (
    <>
      <Header currentPath="/planes-de-estudio" />
      <main>
        <div className="bg-franja-morada px-5 py-6 lg:px-20 lg:py-16">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
            <nav
              aria-label="Recorrido"
              className="text-[13px] font-normal text-white"
            >
              <a href="/" className="transition-opacity hover:opacity-80">
                Inicio
              </a>
              <span aria-hidden="true"> / </span>
              <span>Planes de estudio</span>
            </nav>

            <h1 className="text-[26px] leading-[34px] font-bold text-white lg:text-[36px] lg:leading-[44px]">
              PLANES DE ESTUDIO.
            </h1>

            <GoldCorner />
          </div>
        </div>

        <div className="bg-franja-surface px-5 py-8 lg:px-20 lg:py-14">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8">
            <p className="text-base text-franja-muted">
              Mirá las materias de cada carrera antes de registrarte.
            </p>

            {vm.careers.length > 0 ? (
              <Selectors
                careers={vm.careers}
                selectedCarrera={vm.selectedCarrera}
                selectedAnio={vm.selectedAnio}
                onSelectCareer={vm.selectCareer}
                onSelectPlan={vm.selectPlan}
              />
            ) : null}

            {vm.pageState === "cargando" ? <PlanLoadingState /> : null}
            {vm.pageState === "vacio" ? (
              <EmptyState
                title="Todavía no tenemos este plan"
                message="Lo vamos a sumar pronto. Mientras tanto, podés consultar otro plan."
              />
            ) : null}
            {vm.pageState === "error" ? (
              <ErrorState
                title="No pudimos cargar el plan"
                message="Probá de nuevo en unos minutos."
                onRetry={vm.retry}
              />
            ) : null}

            {vm.pageState === "listo" && vm.plan && vm.careerTitle ? (
              <PlanContent
                plan={vm.plan}
                careerTitle={vm.careerTitle}
                planTitle={vm.planTitle ?? `Plan ${vm.plan.anio_plan}`}
              />
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function PlanLoadingState() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="rounded-[10px] border border-franja-border bg-white p-[18px]"
    >
      <p className="text-sm font-bold text-franja-morada">Cargando el plan…</p>
    </div>
  );
}

function Selectors({
  careers,
  selectedCarrera,
  selectedAnio,
  onSelectCareer,
  onSelectPlan,
}: {
  careers: ReturnType<typeof usePlanesEstudioPage>["careers"];
  selectedCarrera: string | null;
  selectedAnio: number | null;
  onSelectCareer: (slug: string) => void;
  onSelectPlan: (anio: number) => void;
}) {
  const career = careers.find((c) => c.slug === selectedCarrera) ?? careers[0];
  const planes = career?.planes ?? [];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-franja-morada">
            Carrera
          </span>
          <select
            value={selectedCarrera ?? career?.slug ?? ""}
            onChange={(e) => onSelectCareer(e.target.value)}
            className="h-12 rounded-lg border border-franja-border bg-white px-4 text-sm font-bold text-franja-dark"
          >
            {careers.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-franja-morada">
            Plan
          </span>
          <select
            value={selectedAnio ?? ""}
            onChange={(e) => onSelectPlan(Number(e.target.value))}
            disabled={planes.length === 0}
            className="h-12 rounded-lg border border-franja-border bg-white px-4 text-sm font-bold text-franja-dark disabled:opacity-50"
          >
            {planes.map((p) => (
              <option key={p.anio} value={p.anio}>
                {planLabel(p.anio, p.vigente)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-6 flex items-start gap-2 text-sm text-franja-muted">
        <span aria-hidden="true" className="font-bold text-franja-morada">
          i
        </span>
        Es solo para consultar. Tu plan se asigna solo cuando subís el PDF del
        SIU desde tu cuenta.
      </p>
    </div>
  );
}

function PlanContent({
  plan,
  careerTitle,
  planTitle,
}: {
  plan: PlanDetalle;
  careerTitle: string;
  planTitle: string;
}) {
  const groups = buildYearGroups(plan.materias);

  return (
    <div className="space-y-10">
      <p className="text-base font-bold text-franja-dark">
        {careerTitle} · {planTitle}
      </p>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="text-xs font-bold uppercase tracking-wide text-franja-morada">
              {group.title}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.materias.map((m) => (
                <MateriaCard key={m.codigo} materia={m} plan={plan} />
              ))}
              {group.optativas ? (
                <>
                  <p className="sm:col-span-2 text-sm font-bold text-franja-muted">
                    {group.optativas.title}
                  </p>
                  {group.optativas.opciones.map((m) => (
                    <MateriaCard key={m.codigo} materia={m} plan={plan} />
                  ))}
                </>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      {plan.reglas.length > 0 ? (
        <section className="rounded-xl border border-franja-border bg-white p-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-franja-morada">
            Reglas especiales
          </h2>
          <ul className="mt-4 space-y-3">
            {plan.reglas.map((regla, index) => (
              <li key={index} className="text-sm text-franja-muted">
                {regla.texto}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function MateriaCard({
  materia,
  plan,
}: {
  materia: MateriaPlan;
  plan: PlanDetalle;
}) {
  const meta = materiaMeta(materia);
  const corr = correlativasLabel(materia.codigo, plan);

  return (
    <article className="rounded-lg border border-franja-border bg-white p-4 shadow-sm">
      <h3 className="text-base font-bold text-franja-dark">{materia.nombre}</h3>
      {meta ? <p className="mt-1 text-sm text-franja-muted">{meta}</p> : null}
      <p className="mt-3 text-sm text-franja-muted">
        <span className="font-bold text-franja-dark">Correlativas:</span> {corr}
      </p>
    </article>
  );
}
