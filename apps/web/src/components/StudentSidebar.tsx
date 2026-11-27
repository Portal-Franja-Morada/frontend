import { cn } from "@franja/ui/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { isStudentNavActive, studentNavItems } from "../lib/student-nav";
import { studentDisplayName } from "../lib/user-display";
import type { AuthUser } from "../types/auth";

type StudentSidebarProps = {
  user: AuthUser;
  onLogout: () => void;
};

export function StudentSidebar({ user, onLogout }: StudentSidebarProps) {
  const location = useLocation();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 bg-white p-6 lg:w-[280px] lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-muted">
        Centro de
        <br />
        estudiantes
      </p>

      <div>
        <p className="text-xl font-bold text-franja-dark">Tu portal</p>
        <nav
          className="mt-4 flex flex-col gap-3"
          aria-label="Menú del estudiante"
        >
          {studentNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "text-sm font-bold",
                isStudentNavActive(location.pathname, item.to)
                  ? "text-franja-morada"
                  : "text-franja-dark",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto flex flex-col gap-4">
        <p className="text-[13px] leading-snug text-franja-muted">
          {studentDisplayName(user)}
          <br />
          Estudiante
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
