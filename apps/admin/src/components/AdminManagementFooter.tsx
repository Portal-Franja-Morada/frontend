import type { AuthUser } from "../types/auth";
import { adminDisplayName } from "../lib/user-display";

type AdminManagementFooterProps = {
  user: AuthUser | null;
};

export function AdminManagementFooter({ user }: AdminManagementFooterProps) {
  const sessionLabel = user
    ? `Sesión: ${adminDisplayName(user)} · Administradora`
    : "Sesión de administración";

  return (
    <footer className="border-t border-franja-border bg-white px-5 py-10 lg:px-20">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 text-[13px] text-franja-muted">
        <p>Franja Morada · Gestión de contenidos</p>
        <p>{sessionLabel}</p>
        <div className="flex flex-col gap-1 lg:flex-row lg:gap-6">
          <span>Términos y Condiciones</span>
          <span>Política de Privacidad</span>
        </div>
        <p>Acceso restringido al equipo del centro.</p>
      </div>
    </footer>
  );
}
