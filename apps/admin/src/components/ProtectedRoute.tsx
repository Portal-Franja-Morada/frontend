import { LoadingState } from "@franja/ui/components/loading-state";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-franja-surface">
        <LoadingState />
      </div>
    );
  }

  if (!user || user.rol !== "ADMIN") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
