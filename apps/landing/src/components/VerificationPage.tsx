import { Button } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { Footer } from "./Footer";
import { GoldCorner } from "./GoldCorner";
import { Header } from "./Header";
import { ApiError, isNetworkError } from "../lib/auth-api";
import { authInputClassName, authInputErrorClassName } from "../lib/auth-form";
import { DNI_INVALID_MESSAGE, isDniValid, normalizeDni } from "../lib/dni";
import {
  type VerificationDevState,
  readVerificationDevState,
} from "../lib/verification-dev-state";
import { getWebAppUrl } from "../lib/site-urls";
import {
  fetchMeVerification,
  resendEmailVerification,
  submitVerification,
} from "../lib/verification-api";

type Phase =
  | "loading"
  | "form"
  | "verifying"
  | "verified"
  | "pending"
  | "dni-fuera"
  | "email"
  | "conn-error"
  | "verify-error";

type FormNotice = "nombre" | "rechazada" | "intentos" | null;

const LOGIN_PATH = "/ingresar";
const CONTACT_PATH = "#";

function profileUrl(): string {
  return `${getWebAppUrl()}/perfil`;
}

type InitialState = {
  phase: Phase;
  notice: FormNotice;
  dniError: boolean;
  dni: string;
  rejectionReason: string | null;
};

function initialFromDevState(devState: VerificationDevState | null) {
  const base: InitialState = {
    phase: "loading",
    notice: null,
    dniError: false,
    dni: "",
    rejectionReason: null,
  };
  switch (devState) {
    case null:
      return base;
    case "cargando":
      return base;
    case "verificando":
      return { ...base, phase: "verifying" } satisfies InitialState;
    case "verificada":
      return { ...base, phase: "verified" } satisfies InitialState;
    case "pendiente":
      return { ...base, phase: "pending" } satisfies InitialState;
    case "dni-invalido":
      return {
        ...base,
        phase: "form",
        dniError: true,
        dni: "4567891",
      } satisfies InitialState;
    case "error-conexion":
      return { ...base, phase: "conn-error" } satisfies InitialState;
    case "nombre-distinto":
      return {
        ...base,
        phase: "form",
        notice: "nombre",
      } satisfies InitialState;
    case "dni-fuera-padron":
      return { ...base, phase: "dni-fuera" } satisfies InitialState;
    case "rechazada":
      return {
        ...base,
        phase: "form",
        notice: "rechazada",
        rejectionReason: "Motivo de ejemplo del admin.",
      } satisfies InitialState;
    case "falta-email":
      return { ...base, phase: "email" } satisfies InitialState;
    case "error-verificar":
      return { ...base, phase: "verify-error" } satisfies InitialState;
    case "demasiados-intentos":
      return {
        ...base,
        phase: "form",
        notice: "intentos",
      } satisfies InitialState;
  }
}

export function VerificationPage() {
  const formId = useId();
  const nombreId = `${formId}-nombre`;
  const apellidoId = `${formId}-apellido`;
  const dniId = `${formId}-dni`;

  const devState = useMemo(
    () => (import.meta.env.DEV ? readVerificationDevState() : null),
    [],
  );
  const initial = useMemo(() => initialFromDevState(devState), [devState]);

  const [phase, setPhase] = useState<Phase>(initial.phase);
  const [notice, setNotice] = useState<FormNotice>(initial.notice);
  const [rejectionReason, setRejectionReason] = useState<string | null>(
    initial.rejectionReason,
  );
  const [meLoaded, setMeLoaded] = useState(devState !== null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState(initial.dni);
  const [dniError, setDniError] = useState(initial.dniError);
  const [resend, setResend] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const goToLogin = () => {
    window.location.assign(
      `${LOGIN_PATH}?redirect=${encodeURIComponent("/verificacion")}`,
    );
  };

  const loadMe = useCallback(async () => {
    setPhase("loading");
    try {
      const me = await fetchMeVerification();
      setMeLoaded(true);
      if (!me.emailVerificado) {
        setPhase("email");
        return;
      }
      const { estado, motivo, motivoRechazo } = me.verificacion;
      if (estado === "verificado") {
        setPhase("verified");
      } else if (estado === "pendiente") {
        if (motivo === "dni_no_en_padron") {
          setPhase("dni-fuera");
        } else {
          setNotice(motivo === "nombre_no_coincide" ? "nombre" : null);
          setPhase("form");
        }
      } else if (estado === "rechazado") {
        setNotice("rechazada");
        setRejectionReason(motivoRechazo);
        setPhase("form");
      } else {
        setPhase("form");
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        goToLogin();
        return;
      }
      setPhase("conn-error");
    }
  }, []);

  useEffect(() => {
    if (devState) {
      return;
    }
    void loadMe();
  }, [devState, loadMe]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (devState || phase !== "form" || notice === "intentos") {
      return;
    }

    if (!isDniValid(dni)) {
      setDniError(true);
      return;
    }

    setDniError(false);
    setPhase("verifying");

    try {
      const result = await submitVerification({
        dni: normalizeDni(dni),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
      });

      if (result.estado === "verificado") {
        setPhase("verified");
      } else if (result.motivo === "nombre_no_coincide") {
        setNotice("nombre");
        setPhase("form");
      } else {
        setPhase("pending");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          goToLogin();
          return;
        }
        if (error.code === "EMAIL_NO_VERIFICADO") {
          setPhase("email");
          return;
        }
        if (error.status === 429) {
          setNotice("intentos");
          setPhase("form");
          return;
        }
        if (error.status >= 500) {
          setPhase("conn-error");
          return;
        }
        setPhase("verify-error");
        return;
      }
      if (isNetworkError(error) || error instanceof Error) {
        setPhase("conn-error");
        return;
      }
      setPhase("verify-error");
    }
  };

  const handleRetry = () => {
    if (!meLoaded) {
      void loadMe();
      return;
    }
    setPhase("form");
  };

  const handleResend = async () => {
    if (devState) {
      return;
    }
    setResend("sending");
    try {
      await resendEmailVerification();
      setResend("sent");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        goToLogin();
        return;
      }
      setResend("error");
    }
  };

  const formDisabled = notice === "intentos";

  const form = (
    <VerificationForm
      nombreId={nombreId}
      apellidoId={apellidoId}
      dniId={dniId}
      nombre={nombre}
      apellido={apellido}
      dni={dni}
      dniError={dniError}
      disabled={formDisabled}
      submitLabel={
        notice === "nombre" || notice === "rechazada"
          ? "Corregir y reenviar"
          : "Verificar"
      }
      onNombre={setNombre}
      onApellido={setApellido}
      onDni={(value) => {
        setDni(value);
        if (dniError) {
          setDniError(false);
        }
      }}
      onSubmit={(event) => void handleSubmit(event)}
    />
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header currentPath="/verificacion" />

      <section className="bg-franja-morada px-5 py-7 text-white lg:px-20 lg:py-16">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
          <p className="hidden text-[13px] leading-5 text-white lg:block">
            Inicio / Mi cuenta / Verificación
          </p>
          <h1 className="text-[26px] font-bold leading-[34px] lg:text-[36px] lg:leading-[44px]">
            VERIFICÁ QUE SOS ESTUDIANTE.
          </h1>
          <GoldCorner />
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-7 lg:px-20 lg:py-16">
        <div
          className={cn(
            "mx-auto flex w-full flex-col gap-4 lg:items-start",
            phase === "form"
              ? "max-w-[1280px] lg:flex-row lg:justify-center lg:gap-8"
              : "max-w-[560px]",
          )}
        >
          {phase === "form" ? (
            <>
              <div className="flex w-full flex-col gap-4 lg:max-w-[560px]">
                {notice === "nombre" ? (
                  <NoticeBox tone="warning">
                    Revisá que tu nombre y apellido coincidan con tu DNI.
                  </NoticeBox>
                ) : null}
                {notice === "intentos" ? (
                  <NoticeBox tone="error">
                    Probaste muchas veces. Esperá una hora.
                  </NoticeBox>
                ) : null}
                {notice === "rechazada" ? (
                  <>
                    <div className="self-center">
                      <Pill tone="error">VERIFICACIÓN RECHAZADA</Pill>
                    </div>
                    {rejectionReason ? (
                      <div className="rounded-xl border border-franja-border bg-white px-8 py-7">
                        <h2 className="text-xl font-bold leading-7 text-franja-dark">
                          Motivo del admin
                        </h2>
                        <p className="mt-3 text-base leading-[26px] text-franja-muted">
                          “{rejectionReason}”
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : null}
                {notice === "nombre" ? (
                  <div className="self-center">
                    <Pill tone="warning">EN REVISIÓN</Pill>
                  </div>
                ) : null}
                {form}
              </div>
              {notice === null ? <AfterAside /> : null}
            </>
          ) : null}

          {phase === "loading" ? (
            <SkeletonPanel title="Cargando">
              Estamos preparando el formulario…
            </SkeletonPanel>
          ) : null}

          {phase === "verifying" ? (
            <SkeletonPanel title="Verificando…">
              Estamos buscando tu DNI en el padrón. Puede tardar unos segundos.
            </SkeletonPanel>
          ) : null}

          {phase === "verified" ? (
            <StatusPanel>
              <p className="text-sm font-bold leading-5 text-[#246448]">
                ¡Cuenta verificada!
              </p>
              <p className="text-[13px] leading-5 text-franja-muted">
                Encontramos tu DNI en el padrón. Ya podés usar todas las
                secciones del portal.
              </p>
              <Pill tone="success">CUENTA VERIFICADA</Pill>
              <PrimaryLink href={profileUrl()}>Ir a mi perfil</PrimaryLink>
            </StatusPanel>
          ) : null}

          {phase === "pending" ? (
            <StatusPanel tone="warning">
              <p className="text-sm font-bold leading-5 text-franja-morada">
                Pendiente de aprobación manual
              </p>
              <p className="text-[13px] leading-5 text-franja-muted">
                No encontramos tu DNI en el padrón. El centro de estudiantes va
                a revisar tu caso a mano.
              </p>
              <p className="text-[13px] leading-5 text-franja-muted">
                Mientras tanto, podés seguir usando las secciones públicas.
              </p>
              <Pill tone="warning">PENDIENTE DE APROBACIÓN MANUAL</Pill>
              <SecondaryLink href={profileUrl()}>Ir a mi perfil</SecondaryLink>
            </StatusPanel>
          ) : null}

          {phase === "dni-fuera" ? (
            <>
              <div className="self-center">
                <Pill tone="warning">EN REVISIÓN</Pill>
              </div>
              <div className="w-full rounded-xl border border-franja-border bg-white px-8 py-7">
                <h2 className="text-xl font-bold leading-7 text-franja-dark">
                  Tu DNI no figura en el padrón
                </h2>
                <p className="mt-3 text-base leading-[26px] text-franja-muted">
                  Tu DNI no figura en el padrón. Un admin lo va a revisar.
                </p>
              </div>
            </>
          ) : null}

          {phase === "email" ? (
            <div className="w-full rounded-xl border border-franja-border bg-white px-8 py-7">
              <h2 className="text-xl font-bold leading-7 text-franja-dark">
                Primero confirmá tu email
              </h2>
              <p className="mt-3 text-base leading-[26px] text-franja-muted">
                Para verificar que sos estudiante, antes tenés que confirmar tu
                email.
              </p>
              <Button
                type="button"
                onClick={() => void handleResend()}
                disabled={resend === "sending" || resend === "sent"}
                className="mt-3 h-11 rounded-lg bg-franja-morada px-5 text-sm font-bold text-white hover:bg-franja-morada/90"
              >
                {resend === "sending"
                  ? "Reenviando…"
                  : resend === "sent"
                    ? "Mail reenviado"
                    : "Reenviar mail"}
              </Button>
              {resend === "error" ? (
                <p className="mt-3 text-sm text-franja-error" role="alert">
                  No pudimos reenviar el mail. Probá de nuevo.
                </p>
              ) : null}
            </div>
          ) : null}

          {phase === "conn-error" ? (
            <StatusPanel role="alert">
              <p className="text-sm font-bold leading-5 text-franja-error">
                Algo no salió bien
              </p>
              <p className="text-[13px] leading-5 text-franja-muted">
                No pudimos conectarnos con el padrón. Tus datos siguen acá:
                probá de nuevo.
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-lg border border-franja-border bg-white px-5 py-3.5 text-sm font-bold leading-5 text-franja-morada"
              >
                Reintentar
              </button>
            </StatusPanel>
          ) : null}

          {phase === "verify-error" ? (
            <>
              <NoticeBox tone="error">
                No pudimos verificar estos datos. Si creés que es un error,
                escribinos.
              </NoticeBox>
              <div className="flex w-full flex-col gap-3">
                <a
                  href={CONTACT_PATH}
                  className="text-sm font-bold leading-5 text-franja-morada underline"
                >
                  Escribinos
                </a>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="self-start text-sm font-bold leading-5 text-franja-morada"
                >
                  Reintentar
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function VerificationForm({
  nombreId,
  apellidoId,
  dniId,
  nombre,
  apellido,
  dni,
  dniError,
  disabled,
  submitLabel,
  onNombre,
  onApellido,
  onDni,
  onSubmit,
}: {
  nombreId: string;
  apellidoId: string;
  dniId: string;
  nombre: string;
  apellido: string;
  dni: string;
  dniError: boolean;
  disabled: boolean;
  submitLabel: string;
  onNombre: (value: string) => void;
  onApellido: (value: string) => void;
  onDni: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-5 rounded-xl border border-franja-border bg-white p-6 lg:gap-6 lg:p-10"
    >
      <p className="text-xs font-bold leading-[18px] text-franja-morada">
        VERIFICACIÓN DE ALUMNO
      </p>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold leading-7 text-franja-dark lg:text-[26px] lg:leading-[34px]">
          ¿Por qué te lo pedimos?
        </h2>
        <p className="text-base leading-[26px] text-franja-muted">
          Algunas secciones del portal son solo para estudiantes de Ciencias
          Económicas. Para habilitarlas, verificamos tu número de DNI en el
          padrón de alumnos del centro de estudiantes.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-col gap-2 lg:flex-1">
            <label
              htmlFor={nombreId}
              className="text-sm font-bold leading-5 text-franja-dark"
            >
              Nombre
            </label>
            <input
              id={nombreId}
              name="nombre"
              type="text"
              autoComplete="given-name"
              required
              maxLength={100}
              value={nombre}
              onChange={(event) => onNombre(event.target.value)}
              placeholder="Como figura en tu DNI"
              className={authInputClassName}
              disabled={disabled}
            />
          </div>
          <div className="flex flex-col gap-2 lg:flex-1">
            <label
              htmlFor={apellidoId}
              className="text-sm font-bold leading-5 text-franja-dark"
            >
              Apellido
            </label>
            <input
              id={apellidoId}
              name="apellido"
              type="text"
              autoComplete="family-name"
              required
              maxLength={100}
              value={apellido}
              onChange={(event) => onApellido(event.target.value)}
              placeholder="Como figura en tu DNI"
              className={authInputClassName}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={dniId}
            className="text-sm font-bold leading-5 text-franja-dark"
          >
            Número de DNI
          </label>
          <input
            id={dniId}
            name="dni"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            required
            value={dni}
            onChange={(event) => onDni(event.target.value)}
            placeholder="Ej.: 45678912"
            className={cn(
              authInputClassName,
              dniError && authInputErrorClassName,
            )}
            disabled={disabled}
            aria-invalid={dniError}
            aria-describedby={`${dniId}-hint`}
          />
          {dniError ? (
            <p
              id={`${dniId}-hint`}
              className="text-[13px] leading-5 text-franja-error"
              role="alert"
            >
              {DNI_INVALID_MESSAGE}
            </p>
          ) : (
            <p
              id={`${dniId}-hint`}
              className="text-[13px] leading-5 text-franja-muted"
            >
              Podés escribirlo con o sin puntos.
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={disabled}
        className="h-12 w-full rounded-lg bg-franja-morada text-sm font-bold text-white hover:bg-franja-morada/90"
      >
        {submitLabel}
      </Button>
    </form>
  );
}

function AfterAside() {
  return (
    <aside className="flex w-full flex-col gap-6 rounded-2xl border border-franja-gold bg-white p-6 lg:max-w-[400px] lg:p-10">
      <GoldCorner />
      <h2 className="text-xl font-bold leading-7 text-franja-morada">
        ¿QUÉ PASA
        <br />
        DESPUÉS?
      </h2>
      <div className="flex flex-col items-start gap-2">
        <Pill tone="success">CUENTA VERIFICADA</Pill>
        <p className="text-[13px] leading-5 text-franja-muted">
          Si tu DNI figura en el padrón, tu cuenta queda verificada al instante.
        </p>
      </div>
      <div className="flex flex-col items-start gap-2">
        <Pill tone="warning">PENDIENTE DE APROBACIÓN MANUAL</Pill>
        <p className="text-[13px] leading-5 text-franja-muted">
          Si no hay coincidencia, tu cuenta queda pendiente y el centro de
          estudiantes la revisa a mano.
        </p>
      </div>
    </aside>
  );
}

function StatusPanel({
  tone = "default",
  role,
  children,
}: {
  tone?: "default" | "warning";
  role?: "alert";
  children: ReactNode;
}) {
  return (
    <div
      role={role}
      className={cn(
        "flex w-full flex-col items-start gap-2.5 rounded-[10px] border bg-white p-[18px]",
        tone === "warning" ? "border-franja-gold" : "border-franja-border",
      )}
    >
      {children}
    </div>
  );
}

function SkeletonPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-full flex-col items-start gap-2.5 rounded-[10px] border border-franja-border bg-white p-[18px]"
    >
      <p className="text-sm font-bold leading-5 text-franja-morada">{title}</p>
      <span className="h-2.5 w-[220px] max-w-full rounded-[5px] bg-franja-border" />
      <span className="h-2.5 w-[150px] max-w-full rounded-[5px] bg-franja-border" />
      <p className="text-[13px] leading-5 text-franja-muted">{children}</p>
    </div>
  );
}

function NoticeBox({
  tone,
  children,
}: {
  tone: "warning" | "error";
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-[10px] border bg-white px-4 py-3 text-sm font-bold leading-5",
        tone === "error"
          ? "border-franja-error text-franja-error"
          : "border-franja-gold text-franja-dark",
      )}
    >
      <span
        aria-hidden="true"
        className={tone === "error" ? "" : "text-franja-gold"}
      >
        !
      </span>
      <p className="min-w-0 flex-1">{children}</p>
    </div>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: "success" | "warning" | "error";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold leading-[18px]",
        tone === "success" && "bg-[#edf6f0] text-[#246448]",
        tone === "warning" &&
          "border border-franja-gold bg-white text-franja-morada",
        tone === "error" &&
          "border border-franja-error bg-white text-franja-error",
      )}
    >
      {children}
    </span>
  );
}

function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex h-12 w-full items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white hover:bg-franja-morada/90"
    >
      {children}
    </a>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex h-12 w-full items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
    >
      {children}
    </a>
  );
}
