import { getLandingSiteUrl } from "./constants";

export function landingNavLinks() {
  const base = getLandingSiteUrl();
  return [
    { label: "Inicio", href: `${base}/` },
    { label: "Novedades", href: `${base}/novedades` },
    { label: "Eventos", href: `${base}/eventos` },
    { label: "Beneficios", href: `${base}/#` },
  ] as const;
}
