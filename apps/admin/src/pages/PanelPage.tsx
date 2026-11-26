import { AdminLayout } from "../components/AdminLayout";
import { useAuth } from "../hooks/use-auth";
import { adminDisplayName } from "../lib/user-display";

export function PanelPage() {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-6 px-5 py-8 lg:px-10 lg:py-10">
        <nav aria-label="Recorrido" className="text-[13px] text-franja-muted">
          Administración / Resumen
        </nav>
        <h1 className="text-[26px] font-bold text-franja-dark lg:text-[36px]">
          Panel de gestión
        </h1>
        <p className="text-base text-franja-muted">
          Sesión de administración
          {user ? ` · ${adminDisplayName(user)}` : ""}.
        </p>
      </main>
    </AdminLayout>
  );
}
