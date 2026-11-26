import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogoutConfirmDialog } from "../components/LogoutConfirmDialog";
import { StudentFooter } from "../components/StudentFooter";
import { StudentHeader } from "../components/StudentHeader";
import { useAuth } from "../hooks/use-auth";
import { usePerfilPage } from "../hooks/use-perfil-page";
import { getLandingSiteUrl } from "../lib/constants";
import type { MeResponse } from "../types/auth";

function accountBadge(user: MeResponse): { label: string; className: string } {
  if (!user.emailVerificado) {
    return { label: "CONFIRMÁ TU EMAIL", className: "text-franja-muted" };
  }
  if (!user.perfil || user.verificacion.estado === "sin_enviar") {
    return { label: "SIN VERIFICAR", className: "text-franja-error" };
  }
  if (user.perfil.estadoVerificacion === "pendiente") {
    return { label: "EN REVISIÓN", className: "text-franja-morada" };
  }
  if (user.perfil.estadoVerificacion === "verificado") {
    return { label: "CUENTA VERIFICADA", className: "text-franja-morada" };
  }
  return { label: "SIN VERIFICAR", className: "text-franja-error" };
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
  const { loadState, user, savedBanner, dismissSavedBanner, retry, devState } =
    usePerfilPage();
  const [logoutOpen, setLogoutOpen] = useState(
    devState === "confirmar-cierre-sesion",
  );

  const handleLogout = async () => {
    setLogoutOpen(false);
    await logout();
    window.location.href = getLandingSiteUrl();
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StudentHeader currentPath="/perfil" />

      <section className="bg-franja-morada px-5 py-14 text-white lg:px-20 lg:py-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="text-[13px] text-white/90">Inicio / Mi perfil</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            MI PERFIL.
          </h1>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-20 lg:py-14">
        <div className="mx-auto w-full max-w-[1280px]">
          {loadState === "loading" ? (
            <LoadingState />
          ) : loadState === "error" || !user ? (
            <ErrorState
              title="Algo no salió bien"
              message="No pudimos cargar tu perfil. Probá de nuevo en unos segundos."
              onRetry={() => void retry()}
            />
          ) : (
            <ProfileContent user={user} onLogout={() => setLogoutOpen(true)} />
          )}
        </div>
      </section>

      {savedBanner ? <SavedBanner dismiss={dismissSavedBanner} /> : null}

      <LogoutConfirmDialog
        open={logoutOpen}
        onConfirm={() => void handleLogout()}
        onCancel={() => setLogoutOpen(false)}
      />

      <StudentFooter />
    </div>
  );
}

function ProfileContent({
  user,
  onLogout,
}: {
  user: MeResponse;
  onLogout: () => void;
}) {
  const badge = accountBadge(user);
  const displayName = user.perfil?.nombreParaMostrar ?? "Sin nombre cargado";

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

      <IdentityCard
        name={displayName}
        email={user.email}
        badge={badge}
        onLogout={onLogout}
      />

      {showAcademicBlock(user) ? (
        hasAcademicData(user) ? (
          <CareersSection carreras={user.perfil!.carreras} />
        ) : (
          <NoAcademicDataCard />
        )
      ) : null}

      <DataAndDeletionSection />
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
  name,
  email,
  badge,
  onLogout,
}: {
  name: string;
  email: string;
  badge: { label: string; className: string };
  onLogout: () => void;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-2xl font-bold text-franja-dark">{name}</p>
          <p className="mt-1 text-base text-franja-muted">{email}</p>
          <p
            className={cn(
              "mt-3 text-xs font-bold uppercase tracking-wide",
              badge.className,
            )}
          >
            {badge.label}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <span className="flex h-[50px] items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada">
            Editar datos
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="flex h-[50px] items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

function CareersSection({
  carreras,
}: {
  carreras: NonNullable<MeResponse["perfil"]>["carreras"];
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        CARRERAS
      </p>
      <div className="mt-4 space-y-6">
        {carreras.map((career) => (
          <div
            key={career.slug}
            className="border-b border-franja-border pb-6 last:border-0 last:pb-0"
          >
            <p className="text-xl font-bold text-franja-dark">
              {career.nombre}
            </p>
            <p className="mt-1 text-base text-franja-muted">
              {career.anioPlan ? `Plan ${career.anioPlan}` : "Plan sin definir"}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[13px] text-franja-muted">
        El plan se asigna al importar el PDF del plan del SIU.
      </p>
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

function DataAndDeletionSection() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        MIS DATOS Y BAJA
      </p>
      <p className="mt-2 text-base text-franja-muted">
        Descargá una copia de tus datos o da de baja tu cuenta.
      </p>
      <a
        href="/mis-datos"
        className="mt-4 inline-flex text-sm font-bold text-franja-morada"
      >
        Ir a Mis datos y baja
      </a>
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
