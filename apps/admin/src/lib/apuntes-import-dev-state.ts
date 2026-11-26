export type ApuntesImportDevState =
  "importando" | "resultado" | "formato-invalido" | "archivo-grande";

const DEV_STATES: ApuntesImportDevState[] = [
  "importando",
  "resultado",
  "formato-invalido",
  "archivo-grande",
];

export function readApuntesImportDevState(): ApuntesImportDevState | null {
  if (!import.meta.env.DEV || typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) return null;
  return DEV_STATES.includes(value as ApuntesImportDevState)
    ? (value as ApuntesImportDevState)
    : null;
}
