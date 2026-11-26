import { cn } from "@franja/ui/lib/utils";
import { Link, useLocation } from "react-router-dom";
import type { AuthUser } from "../types/auth";
import { adminDisplayName } from "../lib/user-display";

const sidebarItems = [
  { label: "Resumen", to: "/" },
  { label: "Novedades", to: "/novedades" },
  { label: "Eventos", to: "/eventos" },
  { label: "Pendientes", to: "/pendientes" },
  { label: "Importar padrón", to: "/importar-padron" },
  { label: "Banco de apuntes", to: "/apuntes" },
  { label: "Importar apuntes", to: "/importar-apuntes" },
] as const;

type AdminSidebarProps = {
  user: AuthUser;
  onLogout: () => void;
};

export function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 bg-white p-6 lg:w-[280px] lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-muted">
        Centro de
        <br />
        estudiantes
      </p>

      <div>
        <p className="text-xl font-bold text-franja-dark">Gestión del portal</p>
        <nav className="mt-4 flex flex-col gap-3" aria-label="Menú de gestión">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "text-sm font-bold",
                location.pathname === item.to ||
                  (item.to !== "/" && location.pathname.startsWith(item.to))
                  ? "text-franja-morada"
                  : "text-franja-dark",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="text-xs font-bold uppercase tracking-wide text-franja-muted">
        Contenido de ejemplo
      </p>

      <div className="mt-auto flex flex-col gap-4">
        <p className="text-[13px] leading-snug text-franja-muted">
          {adminDisplayName(user)}
          <br />
          Administradora
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="text-left text-sm font-bold text-franja-morada"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
