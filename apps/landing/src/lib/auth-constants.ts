/** Versión vigente de términos; debe coincidir con `TERMS_VERSION` del backend. */
export const TERMS_VERSION = "2026-11";

export const PASSWORD_HINT = "Mínimo 8 caracteres, con al menos un número.";

export function isPasswordValid(password: string): boolean {
  return password.length >= 8 && /\d/.test(password);
}
