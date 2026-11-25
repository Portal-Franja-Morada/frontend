import { LoadingState } from "@franja/ui/components/loading-state";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-franja-surface">
        <LoadingState />
      </div>
    );
  }

  if (user?.rol === "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}
