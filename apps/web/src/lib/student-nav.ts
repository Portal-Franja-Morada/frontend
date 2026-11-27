export const studentNavItems = [
  { label: "Mi perfil", to: "/perfil" },
  { label: "Mis carreras", to: "/mis-carreras" },
  { label: "Importar SIU", to: "/importar-siu" },
  { label: "Mapa curricular", to: "/mi-carrera" },
  { label: "Historial", to: "/historial" },
  { label: "Mis datos", to: "/mis-datos" },
] as const;

/** Atajos del header en desktop (el menú lateral tiene el listado completo). */
export const studentHeaderNavItems = [
  studentNavItems[0],
  studentNavItems[3],
  studentNavItems[4],
  studentNavItems[2],
] as const;

export function isStudentNavActive(pathname: string, to: string): boolean {
  if (to === "/perfil") {
    return pathname === "/perfil";
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
