import { Button } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import { type FormEvent, useId, useMemo, useState } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import {
  ApiError,
  isNetworkError,
  register as registerApi,
} from "../lib/auth-api";
import {
  isPasswordValid,
  PASSWORD_HINT,
  TERMS_VERSION,
} from "../lib/auth-constants";
import { authInputClassName, authInputErrorClassName } from "../lib/auth-form";
import { readRegisterDevState } from "../lib/register-dev-state";

type FieldErrors = {
  confirmPassword?: string;
  terms?: string;
};

function PasswordToggle({
  visible,
  onToggle,
  disabled,
}: {
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="text-[13px] text-franja-morada"
      onClick={onToggle}
      disabled={disabled}
    >
      {visible ? "Ocultar" : "Mostrar"}
    </button>
  );
}

export function RegisterPage() {
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const confirmId = `${formId}-confirm`;
  const termsId = `${formId}-terms`;

  const devState = useMemo(
    () => (import.meta.env.DEV ? readRegisterDevState() : null),
    [],
  );

  const [email, setEmail] = useState(
    devState === "email-duplicado" ? "martina.sosa@ejemplo.com" : "",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(
    devState === "terminos" ? false : devState !== null,
  );
  const [loading, setLoading] = useState(devState === "cargando");
  const [success, setSuccess] = useState(devState === "cuenta-creada");
  const [emailDuplicate, setEmailDuplicate] = useState(
    devState === "email-duplicado",
  );
  const [requestError, setRequestError] = useState(
    devState === "error"
      ? "No pudimos crear tu cuenta. Tus datos siguen acá: probá de nuevo."
      : null,
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(() => {
    if (devState === "contraseñas") {
      return { confirmPassword: "Las contraseñas no coinciden." };
    }
    if (devState === "terminos") {
      return {
        terms:
          "Para crear la cuenta, aceptá los Términos y Condiciones y la Política de Privacidad.",
      };
    }
    return {};
  });

  const resetErrors = () => {
    setRequestError(null);
    setEmailDuplicate(false);
    setFieldErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (devState) {
      return;
    }

    resetErrors();

    const nextFieldErrors: FieldErrors = {};

    if (password !== confirmPassword) {
      nextFieldErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (!termsAccepted) {
      nextFieldErrors.terms =
        "Para crear la cuenta, aceptá los Términos y Condiciones y la Política de Privacidad.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    if (!isPasswordValid(password)) {
      return;
    }

    setLoading(true);

    try {
      await registerApi({
        email: email.trim().toLowerCase(),
        password,
        consentimiento: true,
        versionTerminos: TERMS_VERSION,
      });
      setSuccess(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setEmailDuplicate(true);
        return;
      }

      if (error instanceof Error && error.message.includes("PUBLIC_API_URL")) {
        setRequestError("La API no está configurada en este entorno.");
        return;
      }

      if (isNetworkError(error)) {
        setRequestError(
          "No pudimos crear tu cuenta. Tus datos siguen acá: probá de nuevo.",
        );
        return;
      }

      if (error instanceof ApiError) {
        setRequestError(
          error.status >= 500
            ? "No pudimos crear tu cuenta. Tus datos siguen acá: probá de nuevo."
            : error.message,
        );
        return;
      }

      setRequestError(
        "No pudimos crear tu cuenta. Tus datos siguen acá: probá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header currentPath="/registro" />

      <section className="bg-franja-morada px-5 py-14 text-white lg:px-20 lg:py-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="text-[13px] text-white/90">Inicio / Crear cuenta</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            CREÁ TU CUENTA.
          </h1>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-20 lg:py-14">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
          <div className="w-full rounded-xl bg-white p-6 shadow-sm lg:max-w-[560px] lg:p-10">
            {success ? (
              <SuccessPanel />
            ) : emailDuplicate ? (
              <DuplicateEmailPanel email={email || "este email"} />
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
                  NUEVA CUENTA
                </p>
                <h2 className="mt-3 text-[26px] font-bold text-franja-dark">
                  Sumate al portal
                </h2>
                <p className="mt-2 text-base text-franja-muted">
                  Usá un email al que tengas acceso: ahí te llegan los avisos de
                  tu cuenta.
                </p>

                <form
                  className="mt-8 space-y-5"
                  onSubmit={(event) => void handleSubmit(event)}
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
                      <PasswordToggle
                        visible={showPassword}
                        onToggle={() => setShowPassword((value) => !value)}
                        disabled={loading}
                      />
                    </div>
                    <input
                      id={passwordId}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Creá una contraseña"
                      className={authInputClassName}
                      disabled={loading}
                    />
                    <p className="text-[13px] text-franja-muted">
                      {PASSWORD_HINT}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor={confirmId}
                        className="text-sm font-bold text-franja-dark"
                      >
                        Confirmar contraseña
                      </label>
                      <PasswordToggle
                        visible={showConfirmPassword}
                        onToggle={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        disabled={loading}
                      />
                    </div>
                    <input
                      id={confirmId}
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((current) => ({
                            ...current,
                            confirmPassword: undefined,
                          }));
                        }
                      }}
                      placeholder="Repetí la contraseña"
                      className={cn(
                        authInputClassName,
                        fieldErrors.confirmPassword && authInputErrorClassName,
                      )}
                      disabled={loading}
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      aria-describedby={
                        fieldErrors.confirmPassword
                          ? `${confirmId}-error`
                          : undefined
                      }
                    />
                    {fieldErrors.confirmPassword ? (
                      <p
                        id={`${confirmId}-error`}
                        className="text-sm text-franja-error"
                        role="alert"
                      >
                        {fieldErrors.confirmPassword}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-lg bg-franja-rose px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
                      DESPUÉS, VERIFICAMOS QUE SEAS ESTUDIANTE
                    </p>
                    <p className="mt-2 text-[13px] text-franja-dark">
                      Al terminar te vamos a pedir tu número de DNI para
                      confirmar que estudiás en la facultad.
                    </p>
                  </div>

                  <label
                    htmlFor={termsId}
                    className="flex min-h-11 cursor-pointer items-start gap-3 py-1"
                  >
                    <input
                      id={termsId}
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => {
                        setTermsAccepted(event.target.checked);
                        if (fieldErrors.terms) {
                          setFieldErrors((current) => ({
                            ...current,
                            terms: undefined,
                          }));
                        }
                      }}
                      className="mt-1 size-4 shrink-0 accent-franja-morada"
                      disabled={loading}
                    />
                    <span className="text-[13px] leading-snug text-franja-dark">
                      Leí y acepto los{" "}
                      <a
                        href="/terminos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-franja-morada"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Términos y Condiciones
                      </a>{" "}
                      y la{" "}
                      <a
                        href="/privacidad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-franja-morada"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Política de Privacidad
                      </a>
                    </span>
                  </label>
                  {fieldErrors.confirmPassword || fieldErrors.terms ? (
                    <p className="text-sm font-bold text-franja-dark">
                      Revisá los campos
                    </p>
                  ) : null}

                  {fieldErrors.terms ? (
                    <p className="text-sm text-franja-error" role="alert">
                      {fieldErrors.terms}
                    </p>
                  ) : null}

                  {requestError ? (
                    <RequestErrorPanel
                      title="Algo no salió bien"
                      message={requestError}
                      onRetry={resetErrors}
                    />
                  ) : null}

                  <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "h-12 w-full rounded-lg bg-franja-morada text-sm font-bold text-white hover:bg-franja-morada/90",
                    )}
                  >
                    {loading ? "Creando cuenta…" : "Crear cuenta"}
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
                  ¿Ya te registraste?
                </p>
                <div className="mt-3">
                  <a
                    href="/ingresar"
                    className="flex h-[50px] w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
                  >
                    Ya tengo cuenta
                  </a>
                </div>
              </>
            )}
          </div>

          <aside className="w-full rounded-2xl bg-white p-6 lg:max-w-[400px] lg:p-8">
            <h3 className="text-xl font-bold leading-snug text-franja-morada">
              ES GRATIS Y TE LLEVA
              <br />
              UNOS MINUTOS.
            </h3>
            <ol className="mt-6 space-y-5 text-base text-franja-dark">
              <li className="flex gap-3">
                <span className="font-bold text-franja-morada">1</span>
                <span>Creá tu cuenta con tu email.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-franja-morada">2</span>
                <span>Verificá que sos estudiante con tu DNI.</span>
              </li>
            </ol>
            <p className="mt-6 text-[13px] text-franja-muted">
              Si no aparecés en el padrón, el centro de estudiantes revisa tu
              caso a mano.
            </p>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SuccessPanel() {
  return (
    <div className="py-2">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        CUENTA CREADA
      </p>
      <h2 className="mt-3 text-[26px] font-bold text-franja-dark">
        ¡Cuenta creada!
      </h2>
      <p className="mt-2 text-base text-franja-muted">
        Ya casi está. Ahora verificá que sos estudiante de la facultad.
      </p>
      <a
        href="/verificacion"
        className="mt-8 flex h-12 w-full items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white hover:bg-franja-morada/90"
      >
        Verificar ahora
      </a>
    </div>
  );
}

function DuplicateEmailPanel({ email }: { email: string }) {
  return (
    <div className="py-2">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        ESE EMAIL YA TIENE CUENTA
      </p>
      <h2 className="mt-3 text-[26px] font-bold text-franja-dark">
        Ese email ya tiene cuenta
      </h2>
      <p className="mt-2 text-base text-franja-muted">
        {email} ya está registrado. Ingresá o recuperá tu contraseña.
      </p>
      <div className="mt-8 space-y-3">
        <a
          href="/ingresar"
          className="flex h-12 w-full items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white"
        >
          Ingresar
        </a>
        <span className="flex h-[50px] w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada">
          Recuperar contraseña
        </span>
      </div>
    </div>
  );
}

function RequestErrorPanel({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-franja-error/30 bg-franja-rose px-4 py-4"
    >
      <p className="text-sm font-bold text-franja-error">{title}</p>
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
