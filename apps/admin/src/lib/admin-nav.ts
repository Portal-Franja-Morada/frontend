export const adminNavItems = [
  { label: "Resumen", to: "/" },
  { label: "Novedades", to: "/novedades" },
  { label: "Eventos", to: "/eventos" },
  { label: "Pendientes", to: "/pendientes" },
  { label: "Importar padrón", to: "/importar-padron" },
  { label: "Banco de apuntes", to: "/apuntes" },
  { label: "Importar apuntes", to: "/importar-apuntes" },
] as const;

export function isAdminNavActive(pathname: string, to: string): boolean {
  if (to === "/") {
    return pathname === "/";
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}
