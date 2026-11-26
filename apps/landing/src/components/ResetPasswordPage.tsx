import { Button } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import { type FormEvent, useId, useMemo, useState } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { PASSWORD_HINT, isPasswordValid } from "../lib/auth-constants";
import { ApiError, isNetworkError, resetPassword } from "../lib/auth-api";
import { authInputClassName, authInputErrorClassName } from "../lib/auth-form";

function readToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    new URLSearchParams(window.location.search).get("token")?.trim() ?? null
  );
}

export function ResetPasswordPage() {
  const passwordId = useId();
  const token = useMemo(() => readToken(), []);

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setRequestError(null);

    if (!token) {
      setRequestError("El enlace no es válido o ya venció.");
      return;
    }

    if (!isPasswordValid(password)) {
      setPasswordError(PASSWORD_HINT);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSubmitted(true);
    } catch (error) {
      if (isNetworkError(error)) {
        setRequestError(
          "No pudimos guardar la contraseña. Probá de nuevo en unos segundos.",
        );
        return;
      }
      if (error instanceof ApiError) {
        if (error.status === 429) {
          setRequestError("Demasiados intentos. Probá de nuevo más tarde.");
          return;
        }
        setRequestError(
          error.status >= 500
            ? "No pudimos guardar la contraseña. Probá de nuevo en unos segundos."
            : error.message,
        );
        return;
      }
      setRequestError(
        "No pudimos guardar la contraseña. Probá de nuevo en unos segundos.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header currentPath="/restablecer-clave" />

      <section className="bg-franja-morada px-5 py-14 text-white lg:px-20 lg:py-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="text-[13px] text-white/90">
            Inicio / Restablecer contraseña
          </p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            ELEGÍ UNA NUEVA CONTRASEÑA.
          </h1>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-20 lg:py-14">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="rounded-xl bg-white p-6 shadow-sm lg:p-10">
            {submitted ? (
              <>
                <p className="text-base text-franja-dark">
                  Tu contraseña se actualizó correctamente.
                </p>
                <a href="/ingresar" className="mt-6 inline-block">
                  <Button className="h-12 w-full rounded-lg bg-franja-morada text-sm font-bold text-white hover:bg-franja-morada/90">
                    Ingresar
                  </Button>
                </a>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
                  NUEVA CONTRASEÑA
                </p>
                <p className="mt-3 text-base text-franja-muted">
                  {PASSWORD_HINT}
                </p>

                {!token ? (
                  <p className="mt-6 text-sm text-franja-error">
                    El enlace no es válido o ya venció. Pedí uno nuevo desde{" "}
                    <a
                      href="/recuperar-contrasena"
                      className="font-bold underline"
                    >
                      recuperar contraseña
                    </a>
                    .
                  </p>
                ) : (
                  <form
                    className="mt-6 space-y-5"
                    onSubmit={(event) => void handleSubmit(event)}
                    noValidate
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor={passwordId}
                        className="text-sm font-bold text-franja-dark"
                      >
                        Contraseña nueva
                      </label>
                      <input
                        id={passwordId}
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          if (passwordError) {
                            setPasswordError(null);
                          }
                        }}
                        className={cn(
                          authInputClassName,
                          passwordError && authInputErrorClassName,
                        )}
                        disabled={loading}
                        aria-invalid={Boolean(passwordError)}
                      />
                      {passwordError ? (
                        <p className="text-sm text-franja-error">
                          {passwordError}
                        </p>
                      ) : null}
                    </div>

                    {requestError ? (
                      <p className="text-sm text-franja-error">
                        {requestError}
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-12 w-full rounded-lg bg-franja-morada text-sm font-bold text-white hover:bg-franja-morada/90"
                    >
                      {loading ? "Guardando…" : "Guardar contraseña"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
