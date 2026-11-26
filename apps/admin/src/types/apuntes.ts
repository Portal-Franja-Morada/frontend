export type ProveedorApuntes = "onedrive" | "google-drive";

export type ApunteMateria = {
  codigo: string;
  nombre: string;
  cuatrimestre: number | null;
  opcionDe: string | null;
  tieneApuntes: boolean;
  link: string | null;
  proveedor: ProveedorApuntes | null;
};

export type ApuntesAnio = {
  anio: number;
  materias: ApunteMateria[];
};

export type ApuntesPlanResponse = {
  carrera: string;
  anioPlan: number;
  vigente: boolean;
  totalMaterias: number;
  conApuntes: number;
  anios: ApuntesAnio[];
};

export type ImportLinksResponse = {
  actualizados: number;
  sinCambios: number;
  omitidos: number;
  rechazados: Array<{ fila: number; motivo: string }>;
};

export type CareerItem = {
  slug: string;
  nombre: string;
  planes: Array<{ anio: number; vigente: boolean }>;
};

export type CareersResponse = {
  items: CareerItem[];
};
