import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { Link } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { EditarLinkApuntesDialog } from "../components/EditarLinkApuntesDialog";
import { useAdminApuntesPage } from "../hooks/use-admin-apuntes-page";
import { proveedorLabel } from "../lib/apuntes-api";
import { anioTitulo, cuatrimestreLabel } from "../lib/apuntes-display";
import { planLabel } from "../lib/careers-api";
import type { ApunteMateria } from "../types/apuntes";

const thClass =
  "px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-franja-muted";

const actionClass = "text-sm font-bold text-franja-morada";

export function ApuntesPage() {
  const vm = useAdminApuntesPage();

  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-8 px-5 py-8 lg:px-10 lg:py-10">
        <nav aria-label="Recorrido" className="text-[13px] text-franja-muted">
          Administración / Banco de apuntes
        </nav>

        <div>
          <h1 className="text-[26px] font-bold text-franja-dark lg:text-[36px]">
            BANCO DE APUNTES
          </h1>
          <p className="mt-2 text-base text-franja-muted">
            Administrá los links a apuntes por materia. Solo se aceptan enlaces
            de OneDrive o Google Drive.
          </p>
        </div>

        {vm.careersState === "cargando" ? <LoadingState /> : null}
        {vm.careersState === "error" ? <ErrorState onRetry={vm.retry} /> : null}
        {vm.careersState === "vacio" ? (
          <EmptyState
            title="Sin carreras cargadas"
            message="Cuando haya planes en el sistema, van a aparecer acá."
          />
        ) : null}

        {vm.careersState === "ok" ? (
          <>
            <section className="rounded-xl border border-franja-border bg-white p-6 lg:p-8">
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

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => void vm.exportPlan()}
                  disabled={vm.exporting || vm.dataState !== "ok"}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada disabled:opacity-50"
                >
                  {vm.exporting ? "Exportando…" : "Exportar plan"}
                </button>
                <Link
                  to="/importar-apuntes"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-franja-morada px-5 text-sm font-bold text-white"
                >
                  Importar apuntes
                </Link>
              </div>

              {vm.exportError ? (
                <p className="mt-4 text-sm text-franja-error">
                  {vm.exportError}
                </p>
              ) : null}
            </section>

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

                {vm.data.anios.map((grupo) => (
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
                            <th className={thClass}>Apuntes</th>
                            <th className={thClass}>Proveedor</th>
                            <th className={thClass}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grupo.materias.map((materia) => (
                            <MateriaRow
                              key={materia.codigo}
                              materia={materia}
                              onEdit={vm.openEdit}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))}
              </>
            ) : null}
          </>
        ) : null}
      </main>

      <EditarLinkApuntesDialog
        open={Boolean(vm.editTarget)}
        codigo={vm.editTarget?.codigo ?? ""}
        nombre={vm.editTarget?.nombre ?? ""}
        link={vm.editLink}
        tieneApuntes={vm.editTarget?.tieneApuntes ?? false}
        error={vm.editError}
        submitting={vm.editSubmitting}
        onLinkChange={vm.setEditLink}
        onSave={() => void vm.saveLink()}
        onRemove={() => void vm.removeLink()}
        onCancel={vm.closeEdit}
      />
    </AdminLayout>
  );
}

function MateriaRow({
  materia,
  onEdit,
}: {
  materia: ApunteMateria;
  onEdit: (materia: ApunteMateria) => void;
}) {
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
      <td className="px-3 py-3 text-franja-dark">
        {materia.tieneApuntes ? "Sí" : "No"}
      </td>
      <td className="px-3 py-3 text-franja-muted">
        {proveedorLabel(materia.proveedor)}
      </td>
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={() => onEdit(materia)}
          className={actionClass}
        >
          {materia.tieneApuntes ? "Editar" : "Agregar"}
        </button>
      </td>
    </tr>
  );
}
