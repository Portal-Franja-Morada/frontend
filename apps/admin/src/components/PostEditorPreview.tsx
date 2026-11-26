import { DEFAULT_NEWS_IMAGE } from "../lib/constants";
import { formatPreviewDate, previewCategoryFromTitle } from "../lib/dates";
import { deriveResumen } from "../lib/resumen";

type PostEditorPreviewProps = {
  titulo: string;
  cuerpo: string;
  imagenUrl: string | null;
};

export function PostEditorPreview({
  titulo,
  cuerpo,
  imagenUrl,
}: PostEditorPreviewProps) {
  const title = titulo.trim() || "Título de la publicación";
  const category = previewCategoryFromTitle(titulo);
  const resumen = deriveResumen(cuerpo) || "Resumen de la publicación.";
  const image = imagenUrl ?? DEFAULT_NEWS_IMAGE;

  return (
    <aside className="flex flex-col gap-4">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-muted">
        Vista previa
      </p>
      <article className="overflow-hidden rounded-xl border border-franja-border bg-white">
        <img
          src={image}
          alt=""
          className="h-[190px] w-full object-cover lg:h-[200px]"
          width={409}
          height={200}
        />
        <div className="flex flex-col gap-3 p-[22px]">
          <p className="text-xs font-bold text-franja-morada">
            {category} · {formatPreviewDate()}
          </p>
          <h3 className="text-card-title font-bold text-franja-dark">
            {title}
          </h3>
          <p className="text-[13px] text-franja-muted">{resumen}</p>
          <span className="text-sm font-bold text-franja-morada">
            Leé la nota →
          </span>
        </div>
      </article>
      <p className="text-[13px] text-franja-muted">
        Así se verá la publicación. No es visible hasta que confirmes.
      </p>
    </aside>
  );
}
