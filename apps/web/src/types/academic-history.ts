export type EstadoMateria = "aprobada" | "regular" | "libre" | "cursando";

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

export type AcademicRecordItem = {
  codigo: string;
  nombre: string;
  estado: EstadoMateria;
  nota: number | null;
  aplazos: number[];
  fecha: string | null;
  acta: string | null;
  origen: "siu" | "manual";
};

export type AcademicHistoryResponse = {
  carrera: string;
  anioPlan: number | null;
  registros: AcademicRecordItem[];
  ultimoImport: {
    importedAt: string;
    advertencias: string[];
    resumen: {
      importadas: number;
      regulares: number;
      cursando: number;
      noReconocidas: number;
    };
  } | null;
  ultimoImportHistorial: {
    importedAt: string;
    advertencias: string[];
    resumen: {
      filas: number;
      aplazos: number;
      materiasConAplazos: number;
      fechasCompletadas: number;
      noReconocidas: number;
    };
  } | null;
};

export type AcademicHistoryPatchBody = {
  estado?: EstadoMateria;
  nota?: number | null;
  aplazos?: number[];
};
