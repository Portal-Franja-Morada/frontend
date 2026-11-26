export type Role = "PUBLIC" | "STUDENT" | "VERIFIED_STUDENT" | "ADMIN";

export type StudentCareer = {
  slug: string;
  nombre: string;
  anioPlan: number | null;
};

export type MeVerificacionEstado =
  "sin_enviar" | "pendiente" | "verificado" | "rechazado";

export type EstadoVerificacion = "pendiente" | "verificado" | "rechazado";

export type MeResponse = {
  id: string;
  email: string;
  rol: Role;
  emailVerificado: boolean;
  verificacion: {
    estado: MeVerificacionEstado;
    motivo: "dni_no_en_padron" | "nombre_no_coincide" | null;
    motivoRechazo: string | null;
  };
  perfil: {
    nombre: string;
    apellido: string;
    nombreVisible: string | null;
    nombreParaMostrar: string;
    carreras: StudentCareer[];
    estadoVerificacion: EstadoVerificacion;
  } | null;
};

export type AuthUser = MeResponse;

export type ApiErrorBody = {
  statusCode: number;
  code: string;
  message: string;
};
