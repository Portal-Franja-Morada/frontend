import type { AuthUser } from "../types/auth";

export function adminDisplayName(user: AuthUser): string {
  return user.perfil?.nombreParaMostrar ?? user.email;
}
