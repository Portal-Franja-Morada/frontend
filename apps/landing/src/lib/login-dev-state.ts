export type LoginDevState =
  "cargando" | "credenciales" | "error" | "red" | "429";

const DEV_STATES: LoginDevState[] = [
  "cargando",
  "credenciales",
  "error",
  "red",
  "429",
];

export function readLoginDevState(): LoginDevState | null {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return null;
  }
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) {
    return null;
  }
  return DEV_STATES.includes(value as LoginDevState)
    ? (value as LoginDevState)
    : null;
}
