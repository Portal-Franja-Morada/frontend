import { Button } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import { type FormEvent, useId, useMemo, useState } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ApiError, forgotPassword, isNetworkError } from "../lib/auth-api";
import { authInputClassName, authInputErrorClassName } from "../lib/auth-form";
import {
  EMAIL_INVALID_MESSAGE,
  isEmailComplete,
} from "../lib/email-validation";
import { readForgotPasswordDevState } from "../lib/forgot-password-dev-state";

export function ForgotPasswordPage() {
  const emailId = useId();

  const devState = useMemo(
    () => (import.meta.env.DEV ? readForgotPasswordDevState() : null),
    [],
  );

  const [email, setEmail] = useState(
    devState === "email-invalido" ? "martina.sosa@" : "",
  );
  const [loading, setLoading] = useState(devState === "cargando");
  const [submitted, setSubmitted] = useState(devState === "confirmacion");
  const [emailError, setEmailError] = useState<string | null>(
    devState === "email-invalido" ? EMAIL_INVALID_MESSAGE : null,
  );
  const [requestError, setRequestError] = useState(
    devState === "error"
      ? "No pudimos enviar el enlace. Probá de nuevo en unos segundos."
      : null,
  );

  const resetRequestError = () => {
    setRequestError(null);
  };

  const submitEmail = async (value: string) => {
    if (devState) {
      return;
    }

    setEmailError(null);
    setRequestError(null);

    const trimmed = value.trim();
    if (!isEmailComplete(trimmed)) {
      setEmailError(EMAIL_INVALID_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(trimmed);
      setSubmitted(true);
    } catch (error) {
      if (error instanceof Error && error.message.includes("PUBLIC_API_URL")) {
        setRequestError("La API no está configurada en este entorno.");
        return;
      }

      if (isNetworkError(error)) {
        setRequestError(
          "No pudimos enviar el enlace. Probá de nuevo en unos segundos.",
        );
        return;
      }

      if (error instanceof ApiError) {
        if (error.status === 429) {
          setRequestError(
            "Demasiados intentos. Probá de nuevo en unos segundos.",
          );
          return;
        }
        setRequestError(
          error.status >= 500
            ? "No pudimos enviar el enlace. Probá de nuevo en unos segundos."
            : error.message,
        );
        return;
      }

      setRequestError(
        "No pudimos enviar el enlace. Probá de nuevo en unos segundos.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitEmail(email);
  };

  const handleResend = () => {
    void submitEmail(email);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header currentPath="/recuperar-contrasena" />

      <section className="bg-franja-morada px-5 py-14 text-white lg:px-20 lg:py-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="text-[13px] text-white/90">
            Inicio / Ingresar / Recuperar contraseña
          </p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            RECUPERÁ TU CONTRASEÑA.
          </h1>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-20 lg:py-14">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="rounded-xl bg-white p-6 shadow-sm lg:p-10">
            {submitted ? (
              <ConfirmationPanel loading={loading} onResend={handleResend} />
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
                  RECUPERAR CONTRASEÑA
                </p>
                <h2 className="mt-3 text-[26px] font-bold text-franja-dark">
                  ¿Olvidaste tu contraseña?
                </h2>
                <p className="mt-2 text-base text-franja-muted">
                  Escribí el email de tu cuenta y te mandamos un enlace para
                  crear una nueva.
                </p>

                <form
                  className="mt-8 space-y-5"
                  onSubmit={handleSubmit}
                  noValidate
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
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (emailError) {
                          setEmailError(null);
                        }
                      }}
                      placeholder="nombre@email.com"
                      className={cn(
                        authInputClassName,
                        emailError && authInputErrorClassName,
                      )}
                      disabled={loading}
                      aria-invalid={Boolean(emailError)}
                      aria-describedby={
                        emailError ? `${emailId}-error` : undefined
                      }
                    />
                    {emailError ? (
                      <>
                        <p className="text-sm font-bold text-franja-dark">
                          Revisá el email
                        </p>
                        <p
                          id={`${emailId}-error`}
                          className="text-sm text-franja-error"
                          role="alert"
                        >
                          {emailError}
                        </p>
                      </>
                    ) : null}
                  </div>

                  {requestError ? (
                    <RequestErrorPanel
                      message={requestError}
                      onRetry={resetRequestError}
                    />
                  ) : null}

                  <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "h-12 w-full rounded-lg bg-franja-morada text-sm font-bold text-white hover:bg-franja-morada/90",
                    )}
                  >
                    {loading ? "Estamos enviando el enlace…" : "Enviar enlace"}
                  </Button>
                </form>

                <BackToLoginLink className="mt-5" />
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ConfirmationPanel({
  loading,
  onResend,
}: {
  loading: boolean;
  onResend: () => void;
}) {
  return (
    <div className="py-2">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        CONFIRMACIÓN DE ENVÍO
      </p>
      <h2 className="mt-3 text-[26px] font-bold text-franja-dark">
        ¡REVISÁ TU CORREO!
      </h2>
      <p className="mt-2 text-base text-franja-muted">
        Si el email está registrado, te mandamos un link (vence en 1 hora).
      </p>
      <p className="mt-2 text-[13px] text-franja-muted">
        ¿No te llegó? Revisá la carpeta de spam o pedí otro enlace.
      </p>

      <BackToLoginLink className="mt-8" />

      <Button
        type="button"
        disabled={loading}
        onClick={onResend}
        className={cn(
          "mt-3 h-[50px] w-full rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada hover:bg-franja-rose",
        )}
        variant="outline"
      >
        {loading ? "Estamos enviando el enlace…" : "Reenviar enlace"}
      </Button>
    </div>
  );
}

function RequestErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-franja-error/30 bg-franja-rose px-4 py-4"
    >
      <p className="text-sm font-bold text-franja-error">Algo no salió bien</p>
      <p className="mt-1 text-sm text-franja-dark">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 text-sm font-bold text-franja-morada"
      >
        Reintentar
      </button>
    </div>
  );
}

function BackToLoginLink({ className }: { className?: string } = {}) {
  return (
    <a
      href="/ingresar"
      className={cn(
        "flex h-[50px] w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada",
        className,
      )}
    >
      Volver a ingresar
    </a>
  );
}
