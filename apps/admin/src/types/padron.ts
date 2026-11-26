export type PadronImportResult = {
  insertados: number;
  actualizados: number;
  reverificados: number;
  diferencias: number;
  errores: { fila: number; motivo: string }[];
};
