export type VerificationDevState =
  | "cargando"
  | "verificando"
  | "verificada"
  | "pendiente"
  | "dni-invalido"
  | "error-conexion"
  | "nombre-distinto"
  | "dni-fuera-padron"
  | "rechazada"
  | "falta-email"
  | "error-verificar"
  | "demasiados-intentos";

const DEV_STATES: VerificationDevState[] = [
  "cargando",
  "verificando",
  "verificada",
  "pendiente",
  "dni-invalido",
  "error-conexion",
  "nombre-distinto",
  "dni-fuera-padron",
  "rechazada",
  "falta-email",
  "error-verificar",
  "demasiados-intentos",
];

export function readVerificationDevState(): VerificationDevState | null {
  if (!import.meta.env.DEV) {
    return null;
  }
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) {
    return null;
  }
  return DEV_STATES.includes(value as VerificationDevState)
    ? (value as VerificationDevState)
    : null;
}
