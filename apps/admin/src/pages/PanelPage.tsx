import { Button } from "@franja/ui/components/button";
import { useAuth } from "../hooks/use-auth";
import { useNavigate } from "react-router-dom";

export function PanelPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-franja-surface">
      <header className="border-b border-franja-border bg-white px-5 py-5 lg:px-20">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4">
          <img
            src="/logo.png"
            alt="Franja Morada · Económicas"
            className="h-8 w-auto"
            width={220}
            height={32}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleLogout()}
          >
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-5 py-16">
        <h1 className="text-[26px] font-bold text-franja-dark lg:text-[36px]">
          Panel
        </h1>
        <p className="mt-2 text-base text-franja-muted">
          Sesión de administración{user ? ` · ${user.email}` : ""}.
        </p>
      </main>
    </div>
  );
}
