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
    <aside className="flex w-full shrink-0 px-5 py-8 lg:w-auto lg:px-8 lg:py-10">
      <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-5 lg:w-56">
        <p className="text-xs font-bold uppercase tracking-wide text-franja-muted">
          Centro de
          <br />
          estudiantes
        </p>

        <p className="text-xl font-bold leading-7 text-franja-morada">
          Tu portal
        </p>

        <nav className="flex flex-col gap-3" aria-label="Menú del estudiante">
          {studentNavItems.map((item) => {
            const isActive = isStudentNavActive(location.pathname, item.to);

            return (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  "rounded-lg border px-[18px] py-[13px] text-sm font-bold",
                  isActive
                    ? "border-franja-morada bg-franja-morada text-white"
                    : "border-franja-border bg-white text-franja-morada",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <p className="text-[13px] font-normal leading-snug text-franja-muted">
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
      </div>
    </aside>
  );
}
