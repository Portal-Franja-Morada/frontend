import { Link } from "react-router-dom";
import { DeleteAccountDialog } from "../components/DeleteAccountDialog";
import { StudentLayout } from "../components/StudentLayout";
import { useMisDatosPage } from "../hooks/use-mis-datos-page";

export function MisDatosPage() {
  const vm = useMisDatosPage();

  return (
    <StudentLayout>
      <section className="bg-franja-morada px-5 py-14 text-white lg:px-10 lg:py-16">
        <div className="w-full">
          <p className="text-[13px] text-white/90">
            Inicio /{" "}
            <Link to="/perfil" className="hover:opacity-90">
              Mi perfil
            </Link>{" "}
            / Mis datos
          </p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            MIS DATOS.
          </h1>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-10 lg:py-14">
        <div className="w-full space-y-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
              Tus datos y tu privacidad
            </p>
            <p className="mt-2 text-base text-franja-muted">
              Podés llevarte una copia de tus datos o dar de baja tu cuenta
              cuando quieras.
            </p>
          </div>

          {vm.downloading ? (
            <div
              role="status"
              aria-busy="true"
              className="rounded-[10px] border border-franja-border bg-white p-[18px]"
            >
              <p className="text-sm font-bold text-franja-morada">
                Preparando tu archivo…
              </p>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
              <h2 className="text-xl font-bold text-franja-dark">
                Descargar mis datos
              </h2>
              <p className="mt-2 text-base text-franja-muted">
                Bajás un archivo con todo lo que guardamos de vos.
              </p>
              {vm.downloadError ? (
                <p className="mt-4 text-sm text-franja-error">
                  {vm.downloadError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void vm.download()}
                disabled={vm.downloading}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white disabled:opacity-50 sm:w-auto sm:min-w-[12rem]"
              >
                Descargar mis datos
              </button>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
              <h2 className="text-xl font-bold text-franja-dark">
                Dar de baja mi cuenta
              </h2>
              <p className="mt-2 text-base text-franja-muted">
                Se borran tus datos personales. No se puede deshacer.
              </p>
              <button
                type="button"
                onClick={vm.openDelete}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada sm:w-auto sm:min-w-[12rem]"
              >
                Dar de baja mi cuenta
              </button>
            </div>
          </div>
        </div>
      </section>

      <DeleteAccountDialog
        open={vm.deleteOpen}
        password={vm.password}
        error={vm.deleteError}
        submitting={vm.deleting}
        onPasswordChange={vm.setPassword}
        onConfirm={() => void vm.confirmDelete()}
        onCancel={vm.closeDelete}
      />
    </StudentLayout>
  );
}
