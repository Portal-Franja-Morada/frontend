const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailComplete(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim().toLowerCase());
}

export const EMAIL_INVALID_MESSAGE =
  "Escribí un email completo. Por ejemplo: nombre@email.com";
