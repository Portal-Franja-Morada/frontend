import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { AdminManagementFooter } from "./AdminManagementFooter";
import { AdminManagementHeader } from "./AdminManagementHeader";
import { AdminSidebar } from "./AdminSidebar";

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    void (async () => {
      await logout();
      navigate("/login", { replace: true });
    })();
  };

  return (
    <div className="flex min-h-screen flex-col bg-franja-surface">
      <AdminManagementHeader />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row">
        <AdminSidebar user={user} onLogout={handleLogout} />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
      <AdminManagementFooter user={user} />
    </div>
  );
}
