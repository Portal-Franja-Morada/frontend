export type PendingVerificacionItem = {
  userId: string;
  email: string;
  emailVerificado: boolean;
  nombre: string;
  apellido: string;
  dni: string;
  carrera: string | null;
  motivo: "dni_no_en_padron" | "nombre_no_coincide" | null;
  telefono: string | null;
  enviadaAt: string | null;
  padron: { nombre: string; apellido: string } | null;
  registradoAt: string;
};

export type PendingDiferenciaItem = {
  userId: string;
  dni: string;
  perfil: { nombre: string; apellido: string };
  padron: { nombre: string; apellido: string };
  detectadaAt: string;
};

export type PendingResponse = {
  verificacion: { total: number; items: PendingVerificacionItem[] };
  diferenciasPadron: { total: number; items: PendingDiferenciaItem[] };
};

export type IdentidadResponse = {
  nombre: string;
  apellido: string;
};

export type CorregirIdentidadBody = {
  nombre?: string;
  apellido?: string;
  motivo: string;
};
