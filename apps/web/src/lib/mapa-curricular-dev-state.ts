export type MapaCurricularDevState =
  | "cargando"
  | "error"
  | "sin-carrera"
  | "sin-carrera-sin-verificar"
  | "sin-plan"
  | "sin-plan-sin-verificar"
  | "elegir-carrera"
  | "plan-sin-materias"
  | "detalle-materia";

const DEV_STATES: MapaCurricularDevState[] = [
  "cargando",
  "error",
  "sin-carrera",
  "sin-carrera-sin-verificar",
  "sin-plan",
  "sin-plan-sin-verificar",
  "elegir-carrera",
  "plan-sin-materias",
  "detalle-materia",
];

export function readMapaCurricularDevState(): MapaCurricularDevState | null {
  if (!import.meta.env.DEV) return null;
  const value = new URLSearchParams(window.location.search).get("estado");
  if (!value) return null;
  return DEV_STATES.includes(value as MapaCurricularDevState)
    ? (value as MapaCurricularDevState)
    : null;
}
