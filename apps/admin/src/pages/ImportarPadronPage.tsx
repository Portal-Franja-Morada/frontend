import { cn } from "@franja/ui/lib/utils";
import { Link } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminPadronImportPage } from "../hooks/use-admin-padron-import-page";
import type { PadronImportResult } from "../types/padron";

const ACCEPT = ".csv,.xlsx,.xls";

export function ImportarPadronPage() {
  const vm = useAdminPadronImportPage();

  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-8 px-5 py-8 lg:px-10 lg:py-10">
        <nav aria-label="Recorrido" className="text-[13px] text-franja-muted">
          Administración / Importar padrón
        </nav>

        <div>
          <h1 className="text-[26px] font-bold text-franja-dark lg:text-[36px]">
            IMPORTAR PADRÓN
          </h1>
          <p className="mt-2 text-base text-franja-muted">
            Subí la planilla de alumnos regulares para verificar a los alumnos
            automáticamente.
          </p>
        </div>

        <FormatHelp />

        {vm.importing ? (
          <div
            role="status"
            aria-busy="true"
            className="rounded-xl border border-franja-border bg-white p-6"
          >
            <p className="text-sm font-bold text-franja-morada">Importando…</p>
          </div>
        ) : null}

        {vm.result ? (
          <ImportResultCard
            fileName={vm.file?.name ?? "planilla"}
            result={vm.result}
          />
        ) : null}

        <section className="rounded-xl border border-franja-border bg-white p-6 lg:p-8">
          <div
            className={cn(
              "rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              vm.dragOver
                ? "border-franja-morada bg-franja-surface"
                : "border-franja-border",
            )}
            onDragEnter={(event) => {
              event.preventDefault();
              vm.setDragOver(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              vm.setDragOver(true);
            }}
            onDragLeave={() => vm.setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              vm.setDragOver(false);
              vm.pickFile(event.dataTransfer.files[0] ?? null);
            }}
          >
            <p className="text-base font-bold text-franja-dark">
              Arrastrá la planilla acá
            </p>
            <p className="mt-2 text-sm text-franja-muted">
              o elegila desde tu computadora
            </p>
            <button
              type="button"
              onClick={vm.openPicker}
              disabled={vm.importing}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada disabled:opacity-50"
            >
              Elegir archivo
            </button>
            <input
              ref={vm.inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(event) => vm.onInputChange(event.target.files)}
            />
          </div>

          {vm.file ? (
            <div className="mt-4 rounded-lg border border-franja-border p-4">
              <p className="text-sm font-bold text-franja-dark">
                {vm.fileLabel}
              </p>
              {vm.fileError ? (
                <p className="mt-1 text-sm font-bold text-franja-error">
                  {vm.fileError}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-franja-muted">
              Elegí un archivo para importar.
            </p>
          )}

          {vm.importError ? (
            <p className="mt-4 text-sm text-franja-error">{vm.importError}</p>
          ) : null}

          <button
            type="button"
            disabled={!vm.canImport}
            onClick={() => void vm.importFile()}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white disabled:opacity-50"
          >
            Importar
          </button>
        </section>
      </main>
    </AdminLayout>
  );
}

function FormatHelp() {
  return (
    <section className="rounded-xl border border-franja-border bg-white p-6 lg:p-8">
      <h2 className="text-lg font-bold text-franja-dark">
        Formato de la planilla
      </h2>
      <p className="mt-2 text-base text-franja-muted">
        CSV o Excel, hasta 5 MB. Una fila por alumno, con estas columnas:
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-franja-muted">
        <li>DNI</li>
        <li>apellido</li>
        <li>nombre</li>
        <li>carrera</li>
        <li>activo (sí/no) · opcional</li>
      </ul>
      <a
        href="/planilla-padron-ejemplo.csv"
        download="planilla-padron-ejemplo.csv"
        className="mt-6 inline-flex text-sm font-bold text-franja-morada"
      >
        Descargar planilla de ejemplo
      </a>
    </section>
  );
}

function ImportResultCard({
  fileName,
  result,
}: {
  fileName: string;
  result: PadronImportResult;
}) {
  return (
    <section className="rounded-xl border border-franja-border bg-white p-6 lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-[#246448]">
        ✓ Importamos {fileName}.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="nuevos" value={result.insertados} />
        <Stat label="actualizados" value={result.actualizados} />
        <Stat
          label="alumnos verificados automáticamente"
          value={result.reverificados}
        />
      </div>

      {result.diferencias > 0 ? (
        <p className="mt-6 text-base text-franja-dark">
          {result.diferencias} diferencias de nombre para revisar{" "}
          <Link
            to="/pendientes?tab=diferencias"
            className="font-bold text-franja-morada"
          >
            Ver en Pendientes
          </Link>
        </p>
      ) : null}

      {result.errores.length > 0 ? (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-franja-border">
                <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-franja-muted">
                  N.° de fila
                </th>
                <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-franja-muted">
                  Motivo
                </th>
              </tr>
            </thead>
            <tbody>
              {result.errores.map((row) => (
                <tr
                  key={`${row.fila}-${row.motivo}`}
                  className="border-b border-franja-border last:border-0"
                >
                  <td className="px-3 py-3 text-franja-dark">{row.fila}</td>
                  <td className="px-3 py-3 text-franja-muted">{row.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-[13px] text-franja-muted">
            {result.errores.length} filas con error. Las demás se importaron
            igual.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-franja-border p-4">
      <p className="text-3xl font-bold text-franja-dark">{value}</p>
      <p className="mt-1 text-sm text-franja-muted">{label}</p>
    </div>
  );
}
