export const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Novedades", href: "/novedades" },
  { label: "Eventos", href: "/eventos" },
  { label: "Beneficios", href: "/registro" },
] as const;

export const quickTools = [
  {
    title: "Apuntes",
    description: "Material para estudiar →",
    href: "/ingresar",
  },
  {
    title: "Tu calendario",
    description: "Organizá la cursada →",
    href: "/eventos",
  },
  {
    title: "Planes de estudio",
    description: "Conocé tu recorrido →",
    href: "/planes-de-estudio",
  },
  {
    title: "Comunidad Morada",
    description: "Descubrí beneficios →",
    href: "/registro",
  },
] as const;
