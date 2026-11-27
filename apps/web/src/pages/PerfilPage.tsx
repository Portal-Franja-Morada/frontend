import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogoutConfirmDialog } from "../components/LogoutConfirmDialog";
import { StudentLayout } from "../components/StudentLayout";
import { useAuth } from "../hooks/use-auth";
import { usePerfilPage } from "../hooks/use-perfil-page";
import { getLandingSiteUrl } from "../lib/constants";
import { historyPillClass } from "../lib/materia-display";
import type { MeResponse, StudentCareer } from "../types/auth";

function accountBadge(user: MeResponse): { label: string; pillClass: string } {
  if (!user.emailVerificado) {
    return {
      label: "CONFIRMÁ TU EMAIL",
      pillClass: "bg-[#FAF8F6] text-franja-muted",
    };
  }
  if (!user.perfil || user.verificacion.estado === "sin_enviar") {
    return {
      label: "SIN VERIFICAR",
      pillClass: "border border-franja-border bg-white text-franja-error",
    };
  }
  if (user.perfil.estadoVerificacion === "pendiente") {
    return {
      label: "EN REVISIÓN",
      pillClass: "bg-[#F6ECF0] text-franja-dark",
    };
  }
  if (user.perfil.estadoVerificacion === "verificado") {
    return {
      label: "CUENTA VERIFICADA",
      pillClass: "bg-[#EDF6F0] text-[#246448]",
    };
  }
  return {
    label: "SIN VERIFICAR",
    pillClass: "border border-franja-border bg-white text-franja-error",
  };
}

function userInitials(user: MeResponse): string {
  const perfil = user.perfil;
  if (perfil?.nombre && perfil.apellido) {
    return `${perfil.nombre[0] ?? ""}${perfil.apellido[0] ?? ""}`.toUpperCase();
  }
  if (perfil?.nombreParaMostrar) {
    const parts = perfil.nombreParaMostrar.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
    }
    if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

function showAcademicBlock(user: MeResponse): boolean {
  return Boolean(
    user.emailVerificado &&
    user.perfil &&
    user.perfil.estadoVerificacion === "verificado",
  );
}

function hasAcademicData(user: MeResponse): boolean {
  return (user.perfil?.carreras.length ?? 0) > 0;
}

export function PerfilPage() {
  const { logout } = useAuth();
  const {
    loadState,
    user,
    savedBanner,
    dismissSavedBanner,
    retry,
    devState,
    perfilEmprendedor,
    savingEmprendedor,
    emprendedorError,
    togglePerfilEmprendedor,
  } = usePerfilPage();
  const [logoutOpen, setLogoutOpen] = useState(
    devState === "confirmar-cierre-sesion",
  );

  const handleLogout = async () => {
    setLogoutOpen(false);
    await logout();
    window.location.href = getLandingSiteUrl();
  };

  return (
    <StudentLayout>
      <section className="bg-franja-morada px-5 py-14 text-white lg:px-10 lg:py-16">
        <div className="w-full">
          <p className="text-[13px] text-white/90">Inicio / Mi perfil</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            MI PERFIL.
          </h1>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-10 lg:py-14">
        <div className="w-full">
          {loadState === "loading" ? (
            <LoadingState />
          ) : loadState === "error" || !user ? (
            <ErrorState
              title="Algo no salió bien"
              message="No pudimos cargar tu perfil. Probá de nuevo en unos segundos."
              onRetry={() => void retry()}
            />
          ) : (
            <ProfileContent
              user={user}
              showDemoBadge={Boolean(import.meta.env.DEV && devState)}
              onLogout={() => setLogoutOpen(true)}
              perfilEmprendedor={perfilEmprendedor}
              savingEmprendedor={savingEmprendedor}
              emprendedorError={emprendedorError}
              onPerfilEmprendedorChange={(checked) =>
                void togglePerfilEmprendedor(checked)
              }
            />
          )}
        </div>
      </section>

      {savedBanner ? <SavedBanner dismiss={dismissSavedBanner} /> : null}

      <LogoutConfirmDialog
        open={logoutOpen}
        onConfirm={() => void handleLogout()}
        onCancel={() => setLogoutOpen(false)}
      />
    </StudentLayout>
  );
}

function ProfileContent({
  user,
  showDemoBadge,
  onLogout,
  perfilEmprendedor,
  savingEmprendedor,
  emprendedorError,
  onPerfilEmprendedorChange,
}: {
  user: MeResponse;
  showDemoBadge: boolean;
  onLogout: () => void;
  perfilEmprendedor: boolean;
  savingEmprendedor: boolean;
  emprendedorError: string | null;
  onPerfilEmprendedorChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {!user.emailVerificado ? <EmailBanner email={user.email} /> : null}

      {user.perfil && user.perfil.estadoVerificacion === "pendiente" ? (
        <PendingBanner />
      ) : null}

      {!user.perfil || user.verificacion.estado === "sin_enviar" ? (
        !user.emailVerificado ? null : (
          <VerificationIncompleteBanner />
        )
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <IdentityCard user={user} onLogout={onLogout} />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {showAcademicBlock(user) ? (
            hasAcademicData(user) ? (
              <CareersSection
                carreras={user.perfil!.carreras}
                showDemoBadge={showDemoBadge}
              />
            ) : (
              <NoAcademicDataCard />
            )
          ) : null}

          {user.perfil ? (
            <EmprendedorSection
              checked={perfilEmprendedor}
              saving={savingEmprendedor}
              error={emprendedorError}
              onChange={onPerfilEmprendedorChange}
            />
          ) : null}
          <DataAndDeletionSection />
        </div>
      </div>
    </div>
  );
}

function EmailBanner({ email }: { email: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        Confirmá tu email
      </p>
      <h2 className="mt-2 text-xl font-bold text-franja-dark">
        Confirmá tu email
      </h2>
      <p className="mt-2 text-base text-franja-muted">
        Te mandamos un mail a {email}. Confirmalo para poder verificar tu cuenta
        de alumno.
      </p>
      <a
        href="/confirmar-email"
        className="mt-4 inline-flex text-sm font-bold text-franja-morada"
      >
        Ver cómo confirmar
      </a>
    </div>
  );
}

function PendingBanner() {
  return (
    <div className="rounded-xl border border-franja-border bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        Verificación pendiente
      </p>
      <p className="mt-2 text-base text-franja-muted">
        Tu cuenta está en revisión del centro de estudiantes. Mientras tanto,
        tus datos académicos no se muestran.
      </p>
    </div>
  );
}

function VerificationIncompleteBanner() {
  return (
    <div className="rounded-xl border border-franja-border bg-franja-rose p-6 shadow-sm">
      <p className="text-base text-franja-dark">
        Todavía no cargaste tu nombre ni tu DNI. Completá la verificación para
        usar el módulo académico.
      </p>
      <a
        href="/verificacion"
        className="mt-4 inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-5 text-sm font-bold text-white"
      >
        Completar verificación
      </a>
    </div>
  );
}

function IdentityCard({
  user,
  onLogout,
}: {
  user: MeResponse;
  onLogout: () => void;
}) {
  const badge = accountBadge(user);
  const displayName = user.perfil?.nombreParaMostrar ?? "Sin nombre cargado";
  const initials = userInitials(user);

  return (
    <div className="w-full shrink-0 rounded-xl bg-white p-6 shadow-sm lg:w-[380px] lg:p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-[32px] bg-franja-morada text-xl font-bold text-white">
        {initials}
      </div>

      <div className="mt-6 space-y-1">
        <p className="text-xl font-bold text-franja-dark">{displayName}</p>
        <p className="text-[13px] text-franja-muted">{user.email}</p>
      </div>

      <p className="mt-4">
        <span className={cn(historyPillClass, badge.pillClass)}>
          {badge.label}
        </span>
      </p>

      <hr className="mt-6 border-franja-border" />

      <div className="mt-6 flex flex-col gap-3">
        <Link
          to="/mis-datos"
          className="flex h-[50px] w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
        >
          Editar datos
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-[50px] w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function CareersSection({
  carreras,
  showDemoBadge,
}: {
  carreras: StudentCareer[];
  showDemoBadge: boolean;
}) {
  const note = showDemoBadge
    ? "Carreras y planes de ejemplo. El plan se asigna solo al importar el PDF del plan del SIU."
    : "El plan se asigna al importar el PDF del plan del SIU.";

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        Carreras
      </p>

      <ul className="mt-4 divide-y divide-franja-border">
        {carreras.map((career) => (
          <li key={career.slug} className="py-4 first:pt-0 last:pb-0">
            <p className="text-base font-bold text-franja-dark">
              {career.nombre}
            </p>
            <p className="mt-1 text-[13px] text-franja-muted">
              {career.anioPlan ? `Plan ${career.anioPlan}` : "Plan sin definir"}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[13px] text-franja-muted">{note}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/mis-carreras"
          className="flex h-[50px] flex-1 items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
        >
          Editar
        </Link>
        <Link
          to="/importar-siu"
          className="flex h-[50px] flex-1 items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white"
        >
          Importar PDF del SIU
        </Link>
      </div>
    </div>
  );
}

function NoAcademicDataCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        Sin datos académicos
      </p>
      <h2 className="mt-2 text-xl font-bold text-franja-dark">
        Sin datos académicos
      </h2>
      <p className="mt-2 text-base text-franja-muted">
        Todavía no cargaste tu plan de estudios. Importá el PDF del SIU para ver
        tu carrera y tu plan.
      </p>
      <Link
        to="/importar-siu"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-5 text-sm font-bold text-white"
      >
        Importar PDF del SIU
      </Link>
    </div>
  );
}

function EmprendedorSection({
  checked,
  saving,
  error,
  onChange,
}: {
  checked: boolean;
  saving: boolean;
  error: string | null;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        Perfil emprendedor · opcional
      </p>
      <label
        className={cn(
          "mt-4 flex items-start gap-3",
          saving ? "cursor-wait opacity-70" : "cursor-pointer",
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={saving}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 size-4 rounded border-franja-border accent-franja-morada"
        />
        <span>
          <span className="block text-sm font-bold text-franja-dark">
            Tengo un emprendimiento
          </span>
          <span className="mt-1 block text-sm text-franja-muted">
            Marcalo para recibir convocatorias a ferias de emprendedores. Podés
            cambiarlo cuando quieras.
          </span>
        </span>
      </label>
      {error ? <p className="mt-3 text-sm text-franja-error">{error}</p> : null}
    </div>
  );
}

function DataAndDeletionSection() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        Mis datos y baja
      </p>
      <p className="mt-2 text-base text-franja-muted">
        Descargá una copia de tus datos o da de baja tu cuenta.
      </p>
      <Link
        to="/mis-datos"
        className="mt-4 inline-flex text-sm font-bold text-franja-morada"
      >
        Ir a Mis datos y baja
      </Link>
    </div>
  );
}

function SavedBanner({ dismiss }: { dismiss: () => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-40 w-[min(100%-2.5rem,28rem)] -translate-x-1/2 rounded-lg border border-franja-border bg-white p-4 shadow-lg">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        ¡Datos guardados!
      </p>
      <p className="mt-1 text-sm text-franja-dark">
        Actualizamos tu perfil correctamente.
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
