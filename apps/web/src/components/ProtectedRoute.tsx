import { LoadingState } from "@franja/ui/components/loading-state";
import { getLandingSiteUrl } from "../lib/constants";
import { useAuth } from "../hooks/use-auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const loginUrl = `${getLandingSiteUrl()}/registro`;

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-franja-surface">
        <LoadingState />
      </div>
    );
  }

  if (status === "anonymous") {
    window.location.href = loginUrl;
    return null;
  }

  return children;
}
