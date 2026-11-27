import type { ReactNode } from "react";
import { useAuth } from "../hooks/use-auth";
import { getLandingSiteUrl } from "../lib/constants";
import { StudentFooter } from "./StudentFooter";
import { StudentHeader } from "./StudentHeader";
import { StudentSidebar } from "./StudentSidebar";

type StudentLayoutProps = {
  children: ReactNode;
};

export function StudentLayout({ children }: StudentLayoutProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    void (async () => {
      await logout();
      window.location.href = getLandingSiteUrl();
    })();
  };

  return (
    <div className="flex min-h-screen flex-col bg-franja-surface">
      <StudentHeader />
      <div className="flex w-full flex-1 flex-col lg:flex-row">
        <StudentSidebar user={user} onLogout={handleLogout} />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
      <StudentFooter />
    </div>
  );
}
