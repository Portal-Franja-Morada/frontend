import type { EstadoMateria, MateriaPlan } from "../types/curriculum";

export function estadoLabel(estado: EstadoMateria | null): string {
  if (!estado) return "SIN HACER";
  switch (estado) {
    case "aprobada":
      return "APROBADA";
    case "regular":
      return "REGULAR";
    case "cursando":
      return "CURSANDO";
    case "libre":
      return "LIBRE";
  }
}

export function estadoBadgeClass(estado: EstadoMateria | null): string {
  if (!estado) return "text-franja-muted";
  switch (estado) {
    case "aprobada":
      return "text-[#246448]";
    case "regular":
      return "text-franja-morada";
    case "cursando":
      return "text-franja-dark";
    case "libre":
      return "text-franja-error";
  }
}

export function cuatrimestreLabel(cuatrimestre: number | null): string | null {
  if (cuatrimestre === 1) return "1° cuatrimestre";
  if (cuatrimestre === 2) return "2° cuatrimestre";
  return null;
}

export function anioLabel(anio: number): string {
  return `${anio}° año`;
}

export function formatPromedio(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function isSlot(m: MateriaPlan, materias: MateriaPlan[]): boolean {
  if (m.opcionDe) return false;
  return (
    m.menuDe !== null ||
    materias.some((o) => o.opcionDe === m.codigo) ||
    materias.some((s) => s.menuDe === m.codigo)
  );
}

export function menuCodigo(slot: MateriaPlan): string {
  return slot.menuDe ?? slot.codigo;
}

export function opcionesDelMenu(
  menu: string,
  materias: MateriaPlan[],
): MateriaPlan[] {
  return materias
    .filter((m) => m.opcionDe === menu)
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
}

export function materiaNombre(codigo: string, materias: MateriaPlan[]): string {
  return materias.find((m) => m.codigo === codigo)?.nombre ?? codigo;
}

export function faltanteItem(
  codigo: string,
  para: "cursar" | "rendir",
  materias: MateriaPlan[],
): string {
  const nombre = materiaNombre(codigo, materias);
  if (para === "cursar") return `Cursar ${nombre}`;
  return `Aprobar ${nombre}`;
}
