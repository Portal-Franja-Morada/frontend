export type Preferencias = {
  notificacionesEmail: boolean;
  notificacionesWhatsapp: boolean;
  perfilEmprendedor: boolean;
};

export type ProfileResponse = {
  nombre: string;
  apellido: string;
  nombreVisible: string | null;
  nombreParaMostrar: string;
  dni: string;
  carreras: Array<{
    slug: string;
    nombre: string;
    anioPlan: number | null;
  }>;
  telefono: string | null;
  estadoVerificacion: "sin_enviar" | "pendiente" | "verificado" | "rechazado";
  preferencias: Preferencias;
};

export type UpdateProfileBody = {
  nombreVisible?: string | null;
  telefono?: string | null;
  preferencias?: Partial<Preferencias>;
};
