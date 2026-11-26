export type EstadoMateria = "aprobada" | "regular" | "libre" | "cursando";

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

export type EstadoMapaItem = {
  estado: EstadoMateria | null;
  puedeCursar: boolean;
  puedeRendir: boolean;
  faltanCursar: string[];
  faltanRendir: string[];
  faltanReglas: string[];
  requisitosExtra: string[];
};

export type CurriculumMapResponse = {
  plan: {
    carrera: string;
    anio_plan: number;
    vigente: boolean;
    materias: MateriaPlan[];
    correlativas: unknown[];
    reglas: unknown[];
  };
  mapa: Record<string, EstadoMapaItem>;
  promedios: {
    conAplazos: number | null;
    sinAplazos: number | null;
  };
  avance: {
    materias: { aprobadas: number; total: number; porcentaje: number };
    creditos: {
      aprobadas: number;
      total: number;
      porcentaje: number;
    } | null;
  };
};
