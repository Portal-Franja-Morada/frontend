import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { Link } from "react-router-dom";
import { StudentFooter } from "../components/StudentFooter";
import { StudentHeader } from "../components/StudentHeader";
import {
  VerificationImportGate,
  verificationImportVariant,
} from "../components/VerificationImportGate";
import { useAuth } from "../hooks/use-auth";
import {
  MAX_STUDENT_CAREERS,
  useMisCarrerasPage,
} from "../hooks/use-mis-carreras-page";

export function MisCarrerasPage() {
  const { user, refresh } = useAuth();
  const vm = useMisCarrerasPage(user);
  const verificationGate = verificationImportVariant(user);
  const blockAdd = vm.showUnverifiedAdd || Boolean(verificationGate);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StudentHeader currentPath="/mis-carreras" />

      <section className="bg-franja-morada px-5 py-14 text-white lg:px-20 lg:py-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="text-[13px] text-white/90">Inicio / Mis carreras</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            MIS CARRERAS.
          </h1>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-20 lg:py-14">
        <div className="mx-auto w-full max-w-[1280px]">
          {vm.loadState === "loading" ? (
            <LoadingState />
          ) : vm.loadState === "error" ? (
            <ErrorState
              title="Algo no salió bien"
              message="No pudimos cargar tus carreras. Probá de nuevo en unos segundos."
              onRetry={() => void refresh()}
            />
          ) : (
            <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
              <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
                Tus carreras
              </p>
              <p className="mt-2 text-base text-franja-muted">
                La carrera y el año del plan se cargan solos cuando importás el
                PDF de tu plan del SIU. Podés tener hasta {MAX_STUDENT_CAREERS}{" "}
                carreras.
              </p>

              <ul className="mt-8 space-y-6">
                {vm.draft.map((career, index) => (
                  <li
                    key={career.slug}
                    className="border-b border-franja-border pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-franja-morada">
                          Carrera {index + 1}
                        </p>
                        <p className="mt-1 text-xl font-bold text-franja-dark">
                          {career.nombre}
                        </p>
                        <p className="mt-1 text-base text-franja-muted">
                          {career.anioPlan
                            ? `Plan ${career.anioPlan}`
                            : "Plan sin definir"}
                        </p>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-franja-muted">
                          Asignado desde tu PDF del SIU
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => vm.removeCareer(career.slug)}
                        className="shrink-0 text-sm font-bold text-franja-error"
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-franja-border pt-8">
                <p className="text-base font-bold text-franja-dark">
                  Agregar carrera
                </p>
                <p className="mt-1 text-sm text-franja-muted">
                  Agregás una carrera importando el PDF de su plan del SIU.
                </p>

                {vm.atLimit ? (
                  <p className="mt-4 text-sm font-bold text-franja-muted">
                    Llegaste al máximo de {MAX_STUDENT_CAREERS} carreras.
                  </p>
                ) : blockAdd ? (
                  <div className="mt-4">
                    <VerificationImportGate
                      variant={
                        vm.showUnverifiedAdd
                          ? "sin-enviar"
                          : (verificationGate ?? "sin-enviar")
                      }
                      user={user}
                    />
                  </div>
                ) : (
                  <Link
                    to="/importar-siu"
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada"
                  >
                    Importar PDF del SIU
                  </Link>
                )}
              </div>

              {vm.saveError ? (
                <p className="mt-4 text-sm text-franja-error">{vm.saveError}</p>
              ) : null}

              <button
                type="button"
                disabled={!vm.dirty || vm.saving}
                onClick={() => void vm.save(refresh)}
                className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white disabled:opacity-50 sm:w-auto sm:min-w-[12rem]"
              >
                {vm.saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          )}
        </div>
      </section>

      {vm.savedBanner ? (
        <div className="fixed bottom-5 left-1/2 z-40 w-[min(100%-2.5rem,28rem)] -translate-x-1/2 rounded-lg border border-franja-border bg-white p-4 shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wide text-[#246448]">
            ✓ Guardamos tus carreras.
          </p>
          <button
            type="button"
            onClick={vm.dismissSavedBanner}
            className="mt-2 text-sm font-bold text-franja-morada"
          >
            Cerrar
          </button>
        </div>
      ) : null}

      <StudentFooter />
    </div>
  );
}
