export const navLinks = [
  { label: "Inicio", href: "#", active: true },
  { label: "Novedades", href: "#" },
  { label: "Eventos", href: "#" },
  { label: "Beneficios", href: "#" },
] as const;

export const quickTools = [
  { title: "Apuntes", description: "Material para estudiar →", href: "#" },
  { title: "Tu calendario", description: "Organizá la cursada →", href: "#" },
  {
    title: "Planes de estudio",
    description: "Conocé tu recorrido →",
    href: "#",
  },
  {
    title: "Comunidad Morada",
    description: "Descubrí beneficios →",
    href: "#",
  },
] as const;

export const featuredEvents = [
  {
    day: "24",
    month: "NOV",
    title: "Taller de Matemática I",
    time: "18:00 h",
    location: "Aula 3",
    href: "#",
  },
  {
    day: "27",
    month: "NOV",
    title: "Charla sobre el Plan 2026",
    time: "17:00 h",
    location: "Aula Magna",
    href: "#",
  },
  {
    day: "02",
    month: "DIC",
    title: "Encuentro de ingresantes",
    time: "16:00 h",
    location: "Patio central",
    href: "#",
  },
] as const;

export const latestNews = [
  {
    category: "INGRESANTES · 16 NOV 2026",
    title: "Ingresantes 2027: empezá la facu con toda la info",
    image: "/news-1.png",
    imageAlt: "Estudiantes en el campus universitario",
    href: "#",
  },
  {
    category: "VIDA ACADÉMICA · 15 NOV 2026",
    title: "Plan 2026: conocé las claves de la transición",
    image: "/news-2.png",
    imageAlt: "Aula con estudiantes en clase",
    href: "#",
  },
  {
    category: "HERRAMIENTAS · 14 NOV 2026",
    title: "Más herramientas para preparar tus finales",
    image: "/news-3.png",
    imageAlt: "Estudiante trabajando con material de estudio",
    href: "#",
  },
] as const;
