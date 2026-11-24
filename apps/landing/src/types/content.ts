/** Copiado de @franja/shared (backend) — solo tipos públicos de contenido. */

export type PublicPost = {
  slug: string;
  titulo: string;
  resumen: string;
  imagenUrl: string | null;
  publicadoAt: string;
};

export type PublicEvent = {
  slug: string;
  titulo: string;
  descripcion: string;
  lugar: string;
  inicio: string;
  fin: string | null;
  imagenUrl: string | null;
  publicadoAt: string;
};

export type HomeResponse = {
  novedades: PublicPost[];
  eventos: PublicEvent[];
};

export type PublicPostsPage = {
  items: PublicPost[];
  page: number;
  total: number;
};

export type PublicPostDetail = PublicPost & {
  cuerpo: string;
};

export type PublicEventsPage = {
  items: PublicEvent[];
  page: number;
  total: number;
};
