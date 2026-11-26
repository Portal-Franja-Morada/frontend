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

export type AdminPost = {
  id: string;
  slug: string;
  titulo: string;
  resumen: string;
  cuerpo: string;
  imagenUrl: string | null;
  imagenPublicId: string | null;
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
};

export type UpdatePostPayload = Partial<CreatePostPayload>;
