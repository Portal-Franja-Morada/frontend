import type { CareerItem, MateriaPlan, PlanDetalle } from "../types/curriculum";

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

export function planLabel(anio: number, vigente: boolean): string {
  return vigente ? `Plan ${anio} (vigente)` : `Plan ${anio}`;
}

function materiaNombre(codigo: string, materias: MateriaPlan[]): string {
  return materias.find((m) => m.codigo === codigo)?.nombre ?? codigo;
}

export function correlativasLabel(
  codigo: string,
  plan: Pick<PlanDetalle, "correlativas" | "materias">,
): string {
  const nombres = plan.correlativas
    .filter((c) => c.materia_codigo === codigo && c.para === "cursar")
    .map((c) => materiaNombre(c.requiere_codigo, plan.materias));

  if (nombres.length === 0) return "no tiene";
  if (nombres.length === 1) return nombres[0]!;
  if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]}`;
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

export function materiaMeta(materia: MateriaPlan): string | null {
  const cuat = cuatrimestreLabel(materia.cuatrimestre);
  const carga =
    materia.horas != null
      ? `${materia.horas} h`
      : materia.creditos != null
        ? `${materia.creditos} créditos`
        : null;

  const parts = [cuat, carga].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
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

export type YearGroup = {
  key: string;
  title: string;
  materias: MateriaPlan[];
  optativas?: { title: string; opciones: MateriaPlan[] };
};

export function buildYearGroups(materias: MateriaPlan[]): YearGroup[] {
  const roots = materias.filter((m) => !m.opcionDe && !isSlot(m, materias));
  const slots = materias.filter((m) => isSlot(m, materias));
  const years = [...new Set(roots.map((m) => m.anio))].sort((a, b) => a - b);
  const groups: YearGroup[] = [];

  for (const anio of years) {
    const delAnio = roots
      .filter((m) => m.anio === anio)
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
    groups.push({
      key: `anio-${anio}`,
      title: anioTitulo(anio),
      materias: delAnio,
    });
  }

  for (const slot of slots) {
    const menu = menuCodigo(slot);
    const opciones = opcionesDelMenu(menu, materias);
    const title = opciones.length > 0 ? "Optativa · elegí 1" : slot.nombre;
    groups.push({
      key: `slot-${slot.codigo}`,
      title: anioTitulo(slot.anio),
      materias: [],
      optativas: { title, opciones },
    });
  }

  return groups;
}

export function defaultSelection(careers: CareerItem[]) {
  const career = careers[0];
  if (!career) return null;
  const plan =
    career.planes.find((p) => p.vigente) ?? career.planes[0] ?? null;
  if (!plan) return null;
  return { carrera: career.slug, anio: plan.anio };
}

export function selectionFromUrl(
  careers: CareerItem[],
  params: URLSearchParams,
) {
  const slug = params.get("carrera");
  const anioRaw = params.get("plan");
  if (!slug || !anioRaw) return defaultSelection(careers);
  const anio = Number(anioRaw);
  if (!Number.isFinite(anio)) return defaultSelection(careers);
  const career = careers.find((c) => c.slug === slug);
  if (!career?.planes.some((p) => p.anio === anio)) return defaultSelection(careers);
  return { carrera: slug, anio };
}
