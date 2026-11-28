export type ContentEstado = "borrador" | "publicado";

export type AdminPostsPage = {
  items: AdminPost[];
  page: number;
  total: number;
};

export type AdminPostsStats = {
  total: number;
  publicados: number;
  borradores: number;
};

export type GaleriaImagen = {
  url: string;
  publicId: string;
};

export type AdminPost = {
  id: string;
  slug: string;
  titulo: string;
  resumen: string;
  cuerpo: string;
  imagenUrl: string | null;
  imagenPublicId: string | null;
  galeria: GaleriaImagen[];
  estado: ContentEstado;
  publicadoAt: string | null;
  autorId: string;
  createdAt: string;
  updatedAt: string;
};

export type UploadResult = {
  url: string;
  publicId: string;
};

export type CreatePostPayload = {
  titulo: string;
  resumen: string;
  cuerpo: string;
  imagenUrl?: string | null;
  imagenPublicId?: string | null;
  galeria?: GaleriaImagen[];
};

export type UpdatePostPayload = Partial<CreatePostPayload>;

export type AdminContentStats = AdminPostsStats;

export type AdminEventsPage = {
  items: AdminEvent[];
  page: number;
  total: number;
};

export type AdminEvent = {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  lugar: string;
  inicio: string;
  fin: string | null;
  imagenUrl: string | null;
  imagenPublicId: string | null;
  galeria: GaleriaImagen[];
  estado: ContentEstado;
  publicadoAt: string | null;
  autorId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEventPayload = {
  titulo: string;
  descripcion: string;
  lugar: string;
  inicio: string;
  fin?: string | null;
  imagenUrl?: string | null;
  imagenPublicId?: string | null;
  galeria?: GaleriaImagen[];
};

export type UpdateEventPayload = Partial<CreateEventPayload>;
