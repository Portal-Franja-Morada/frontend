const CAREER_LABELS: Record<string, string> = {
  contador: "Contador Público",
  administracion: "Licenciatura en Administración",
  economia: "Licenciatura en Economía",
  "comercio-exterior": "Licenciatura en Comercio Exterior",
  "relaciones-laborales": "Licenciatura en Relaciones Laborales",
};

export function careerLabel(slug: string): string {
  return CAREER_LABELS[slug] ?? slug;
}
