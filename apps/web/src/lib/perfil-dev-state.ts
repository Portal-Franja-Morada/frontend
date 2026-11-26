export type PerfilDevState =
  | "cargando"
  | "sin-datos-academicos"
  | "verificacion-pendiente"
  | "error"
  | "datos-guardados"
  | "confirmar-cierre-sesion"
  | "email-sin-confirmar"
  | "verificacion-sin-completar";

const DEV_STATES: PerfilDevState[] = [
  "cargando",
  "sin-datos-academicos",
  "verificacion-pendiente",
  "error",
  "datos-guardados",
  "confirmar-cierre-sesion",
  "email-sin-confirmar",
  "verificacion-sin-completar",
];

export function readPerfilDevState(): PerfilDevState | null {
  if (!import.meta.env.DEV) return null;
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) return null;
  return DEV_STATES.includes(value as PerfilDevState)
    ? (value as PerfilDevState)
    : null;
}
