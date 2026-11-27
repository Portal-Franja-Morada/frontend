import type { AuthUser } from "../types/auth";

export function studentDisplayName(user: AuthUser): string {
  return user.perfil?.nombreParaMostrar ?? user.email;
}
