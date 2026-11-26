function ordinal(n: number, feminine: boolean): string {
  if (n === 1) return feminine ? "1.ª" : "1.er";
  if (n === 2) return feminine ? "2.ª" : "2.º";
  if (n === 3) return "3.er";
  return `${n}.º`;
}

export function anioTitulo(anio: number): string {
  return `${ordinal(anio, false).toUpperCase()} AÑO`;
}

export function cuatrimestreLabel(cuatrimestre: number | null): string | null {
  if (cuatrimestre === 1) return `${ordinal(1, true)} cuatrimestre`;
  if (cuatrimestre === 2) return `${ordinal(2, true)} cuatrimestre`;
  return null;
}
