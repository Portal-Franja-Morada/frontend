import { Button } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import { type FormEvent, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminFooter } from "../components/AdminFooter";
import { AdminHeader } from "../components/AdminHeader";
import { ApiError, isNetworkError } from "../lib/api";
import { authInputClassName } from "../lib/auth-form";
import { getLandingSiteUrl } from "../lib/constants";
import { useAuth } from "../hooks/use-auth";

type LoginErrorKind = "credentials" | "network" | "admin" | "config";

function resolveErrorKind(error: unknown): {
  kind: LoginErrorKind;
  message: string;
} {
  if (error instanceof Error && error.name === "NotAdminError") {
    return {
      kind: "admin",
      message: "Esta cuenta no tiene permisos de administración.",
    };
  }

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return { kind: "credentials", message: "Credenciales inválidas." };
    }
    if (error.status === 429) {
      return {
        kind: "credentials",
        message: "Demasiados intentos. Probá de nuevo más tarde.",
      };
    }
    return { kind: "network", message: error.message };
  }

  if (error instanceof Error && error.message.includes("VITE_API_URL")) {
    return {
      kind: "config",
      message: "La API no está configurada en este entorno.",
    };
  }

  if (isNetworkError(error)) {
    return {
      kind: "network",
      message: "No pudimos conectar con el servidor. Verificá tu conexión.",
    };
  }

  return {
    kind: "network",
    message: "Ocurrió un error inesperado. Intentá de nuevo.",
  };
}

export function LoginPage() {
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/", { replace: true });
    } catch (caught) {
      setError(resolveErrorKind(caught).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AdminHeader />

      <section className="bg-franja-morada px-5 py-14 text-white lg:px-20 lg:py-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="text-[13px] text-white/90">Inicio / Ingresar</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            INGRESÁ A TU CUENTA.
          </h1>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-20 lg:py-14">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
          <div className="w-full rounded-xl bg-white p-6 shadow-sm lg:max-w-[560px] lg:p-10">
            <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
              CUENTA DE ESTUDIANTE
            </p>
            <h2 className="mt-3 text-[26px] font-bold text-franja-dark">
              ¡Qué bueno verte de nuevo!
            </h2>
            <p className="mt-2 text-base text-franja-muted">
              Ingresá con el email con el que creaste tu cuenta.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={(e) => void handleSubmit(e)}
            >
              <div className="space-y-2">
                <label
                  htmlFor={emailId}
                  className="text-sm font-bold text-franja-dark"
                >
                  Email
                </label>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nombre@email.com"
                  className={authInputClassName}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor={passwordId}
                    className="text-sm font-bold text-franja-dark"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="text-[13px] text-franja-morada"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={loading}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <input
                  id={passwordId}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tu contraseña"
                  className={authInputClassName}
                  disabled={loading}
                />
              </div>

              <p className="text-[13px] text-franja-morada">
                ¿Olvidaste tu contraseña?
              </p>

              {error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-franja-error/30 bg-franja-rose px-4 py-3 text-sm text-franja-error"
                >
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "h-12 w-full rounded-lg bg-franja-morada text-sm font-bold text-white hover:bg-franja-morada/90",
                )}
              >
                {loading ? "Ingresando…" : "Ingresar"}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <span
                className="h-px flex-1 bg-franja-border"
                aria-hidden="true"
              />
              <span className="text-[13px] text-franja-muted">o</span>
              <span
                className="h-px flex-1 bg-franja-border"
                aria-hidden="true"
              />
            </div>

            <p className="mt-6 text-center text-[13px] text-franja-muted">
              ¿Todavía no tenés cuenta?
            </p>
            <a
              href={`${getLandingSiteUrl()}/registro`}
              className="mt-3 flex h-[50px] w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
            >
              Crear cuenta
            </a>
          </div>

          <aside className="w-full rounded-2xl bg-white p-6 lg:max-w-[400px] lg:p-8">
            <h3 className="text-xl font-bold leading-snug text-franja-morada">
              TU CUENTA TE ABRE
              <br />
              TODO EL PORTAL.
            </h3>
            <p className="mt-4 text-base text-franja-dark">
              Con una sola cuenta accedés al calendario, los apuntes, las
              permutas y los beneficios de Comunidad Morada.
            </p>
            <p className="mt-4 text-[13px] text-franja-muted">
              Es gratis y es solo para estudiantes de Ciencias Económicas.
            </p>
          </aside>
        </div>
      </section>

      <AdminFooter />
    </div>
  );
}
