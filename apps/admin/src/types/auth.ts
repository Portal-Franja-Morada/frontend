export type Role = "PUBLIC" | "STUDENT" | "VERIFIED_STUDENT" | "ADMIN";

export type MeResponse = {
  id: string;
  email: string;
  rol: Role;
  emailVerificado: boolean;
  perfil?: {
    nombreParaMostrar: string;
  } | null;
};

export type ApiErrorBody = {
  statusCode: number;
  code: string;
  message: string;
};

export type AuthUser = MeResponse;
