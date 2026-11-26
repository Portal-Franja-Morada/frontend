export type AcademicHistoryUploadResponse = {
  tipoDocumento: "plan" | "historial";
  carrera: string;
  anioPlan: number;
  importadas?: number;
  regulares?: number;
  cursando?: number;
  noReconocidas?: number;
  aplazos?: number;
  materiasConAplazos?: number;
  fechasCompletadas?: number;
  advertencias: string[];
};
