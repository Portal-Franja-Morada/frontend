/** Quita puntos, espacios y guiones: "45.678.912" → "45678912". */
export function normalizeDni(value: string): string {
  return value.replace(/[.\s-]/g, "");
}

/** El backend acepta DNI de 7 u 8 dígitos. */
export function isDniValid(value: string): boolean {
  return /^\d{7,8}$/.test(normalizeDni(value));
}

export const DNI_INVALID_MESSAGE =
  "El DNI tiene que tener 7 u 8 números. Revisalo.";
