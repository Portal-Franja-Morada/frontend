export type PadronImportDevState =
  "importando" | "resultado" | "formato-invalido" | "archivo-grande";

const DEV_STATES: PadronImportDevState[] = [
  "importando",
  "resultado",
  "formato-invalido",
  "archivo-grande",
];

export function readPadronImportDevState(): PadronImportDevState | null {
  if (!import.meta.env.DEV || typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) return null;
  return DEV_STATES.includes(value as PadronImportDevState)
    ? (value as PadronImportDevState)
    : null;
}
