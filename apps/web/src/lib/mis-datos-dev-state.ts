export type MisDatosDevState =
  "descargando" | "modal-baja" | "contrasena-incorrecta";

const DEV_STATES: MisDatosDevState[] = [
  "descargando",
  "modal-baja",
  "contrasena-incorrecta",
];

export function readMisDatosDevState(): MisDatosDevState | null {
  if (!import.meta.env.DEV) return null;
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) return null;
  return DEV_STATES.includes(value as MisDatosDevState)
    ? (value as MisDatosDevState)
    : null;
}
