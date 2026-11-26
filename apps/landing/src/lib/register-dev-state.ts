export type RegisterDevState =
  | "cargando"
  | "contraseñas"
  | "error"
  | "email-duplicado"
  | "cuenta-creada"
  | "terminos";

const DEV_STATES: RegisterDevState[] = [
  "cargando",
  "contraseñas",
  "error",
  "email-duplicado",
  "cuenta-creada",
  "terminos",
];

export function readRegisterDevState(): RegisterDevState | null {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return null;
  }
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) {
    return null;
  }
  return DEV_STATES.includes(value as RegisterDevState)
    ? (value as RegisterDevState)
    : null;
}
