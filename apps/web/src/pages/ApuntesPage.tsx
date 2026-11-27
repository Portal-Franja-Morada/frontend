import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { StudentLayout } from "../components/StudentLayout";
import { useApuntesPage } from "../hooks/use-apuntes-page";
import { proveedorLabel } from "../lib/apuntes-api";
import { anioTitulo, cuatrimestreLabel } from "../lib/apuntes-display";
import { planLabel } from "../lib/careers-public-api";
import type { ApunteMateria } from "../types/apuntes";

const thClass =
  "px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-franja-muted";

export function ApuntesPage() {
  const vm = useApuntesPage();

  return (
    <StudentLayout>
      <section className="bg-franja-morada px-5 py-14 text-white lg:px-10 lg:py-16">
        <div className="w-full">
          <p className="text-[13px] text-white/90">Inicio / Banco de apuntes</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            BANCO DE APUNTES.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/90">
            Encontrá links compartidos por estudiantes a apuntes en OneDrive o
            Google Drive, materia por materia.
          </p>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-10 lg:py-14">
        <div className="w-full space-y-8">
          {vm.careersState === "cargando" ? <LoadingState /> : null}
          {vm.careersState === "error" ? (
            <ErrorState onRetry={vm.retry} />
          ) : null}
          {vm.careersState === "vacio" ? (
            <EmptyState
              title="Sin carreras cargadas"
              message="Cuando haya planes en el sistema, van a aparecer acá."
            />
          ) : null}

          {vm.careersState === "ok" ? (
            <>
              <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-franja-morada">
                      Carrera
                    </span>
                    <select
                      value={vm.selectedCarrera ?? ""}
                      onChange={(e) => vm.selectCareer(e.target.value)}
                      className="h-12 rounded-lg border border-franja-border bg-white px-4 text-sm font-bold text-franja-dark"
                    >
                      {vm.careers.map((career) => (
                        <option key={career.slug} value={career.slug}>
                          {career.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-franja-morada">
                      Plan
                    </span>
                    <select
                      value={vm.selectedPlan ?? ""}
                      onChange={(e) => vm.selectPlan(Number(e.target.value))}
                      disabled={!vm.career?.planes.length}
                      className="h-12 rounded-lg border border-franja-border bg-white px-4 text-sm font-bold text-franja-dark disabled:opacity-50"
                    >
                      {vm.career?.planes.map((plan) => (
                        <option key={plan.anio} value={plan.anio}>
                          {planLabel(plan.anio, plan.vigente)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-6 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={vm.soloConApuntes}
                    onChange={(e) => vm.setSoloConApuntes(e.target.checked)}
                    className="size-4 rounded border-franja-border text-franja-morada"
                  />
                  <span className="text-sm font-bold text-franja-dark">
                    Mostrar solo materias con apuntes
                  </span>
                </label>
              </div>

              {vm.dataState === "cargando" ? <LoadingState /> : null}
              {vm.dataState === "error" ? (
                <ErrorState
                  message={vm.dataError ?? undefined}
                  onRetry={vm.retry}
                />
              ) : null}
              {vm.dataState === "vacio" ? (
                <EmptyState
                  title="Plan sin materias"
                  message="Elegí otra carrera o plan para continuar."
                />
              ) : null}

              {vm.dataState === "ok" && vm.data ? (
                <>
                  <p className="text-base text-franja-muted">
                    {vm.data.conApuntes} de {vm.data.totalMaterias} materias
                    tienen apuntes cargados.
                  </p>

                  {vm.filteredAnios.length === 0 ? (
                    <EmptyState
                      title="Sin apuntes en este plan"
                      message="Probá otra carrera o desactivá el filtro."
                    />
                  ) : (
                    vm.filteredAnios.map((grupo) => (
                      <section
                        key={grupo.anio}
                        className="rounded-xl border border-franja-border bg-white p-6 lg:p-8"
                      >
                        <h2 className="text-lg font-bold text-franja-dark">
                          {anioTitulo(grupo.anio)}
                        </h2>
                        <div className="mt-4 overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b border-franja-border">
                                <th className={thClass}>Materia</th>
                                <th className={thClass}>Cuatrimestre</th>
                                <th className={thClass}>Proveedor</th>
                                <th className={thClass}>Apuntes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {grupo.materias.map((materia) => (
                                <MateriaRow key={materia.codigo} materia={materia} />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    ))
                  )}
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </StudentLayout>
  );
}

function MateriaRow({ materia }: { materia: ApunteMateria }) {
  const cuatri = cuatrimestreLabel(materia.cuatrimestre);

  return (
    <tr className="border-b border-franja-border last:border-0">
      <td className="px-3 py-3 text-franja-dark">
        <p className="font-bold">{materia.nombre}</p>
        <p className="text-[13px] text-franja-muted">
          {materia.codigo}
          {materia.opcionDe ? ` · opción de ${materia.opcionDe}` : ""}
        </p>
      </td>
      <td className="px-3 py-3 text-franja-muted">{cuatri ?? "—"}</td>
      <td className="px-3 py-3 text-franja-muted">
        {proveedorLabel(materia.proveedor)}
      </td>
      <td className="px-3 py-3">
        {materia.tieneApuntes && materia.link ? (
          <a
            href={materia.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-lg bg-franja-morada px-4 text-sm font-bold text-white hover:bg-franja-morada/90",
            )}
          >
            Abrir ↗
          </a>
        ) : (
          <span className="text-sm text-franja-muted">Sin apuntes</span>
        )}
      </td>
    </tr>
  );
}
