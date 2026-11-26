export type PlanSummary = {
  anio: number;
  vigente: boolean;
};

export type CareerItem = {
  slug: string;
  nombre: string;
  planes: PlanSummary[];
};

export type CareersResponse = {
  items: CareerItem[];
};

export type MateriaPlan = {
  codigo: string;
  nombre: string;
  anio: number;
  cuatrimestre: number | null;
  creditos: number | null;
  horas: number | null;
  opcionDe: string | null;
  menuDe: string | null;
};

export type Correlativa = {
  materia_codigo: string;
  requiere_codigo: string;
  para: "cursar" | "rendir";
  estado_requerido: "regular" | "aprobada";
};

export type PlanRegla = {
  texto: string;
};

export type PlanDetalle = {
  carrera: string;
  anio_plan: number;
  vigente: boolean;
  materias: MateriaPlan[];
  correlativas: Correlativa[];
  reglas: PlanRegla[];
};
