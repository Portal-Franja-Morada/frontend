export type ForgotPasswordDevState =
  "cargando" | "email-invalido" | "error" | "confirmacion";

const DEV_STATES: ForgotPasswordDevState[] = [
  "cargando",
  "email-invalido",
  "error",
  "confirmacion",
];

export function readForgotPasswordDevState(): ForgotPasswordDevState | null {
  if (!import.meta.env.DEV) {
    return null;
  }
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) {
    return null;
  }
  return DEV_STATES.includes(value as ForgotPasswordDevState)
    ? (value as ForgotPasswordDevState)
    : null;
}
