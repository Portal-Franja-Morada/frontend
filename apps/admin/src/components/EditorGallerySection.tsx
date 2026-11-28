import {
  GALERIA_MAX,
  type GaleriaEditorItem,
} from "../hooks/use-editor-gallery";

type EditorGallerySectionProps = {
  items: GaleriaEditorItem[];
  previewUrls: string[];
  disabled: boolean;
  galleryError: string | null;
  onAddFiles: (fileList: FileList | null) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

export function EditorGallerySection({
  items,
  previewUrls,
  disabled,
  galleryError,
  onAddFiles,
  onRemove,
  onMoveUp,
  onMoveDown,
}: EditorGallerySectionProps) {
  const remaining = GALERIA_MAX - items.length;

  return (
    <div>
      <span className="text-sm font-bold text-franja-dark">Galería</span>
      <p className="mt-1 text-[13px] text-franja-muted">
        Hasta {GALERIA_MAX} imágenes adicionales. Se suben al guardar o
        publicar.
      </p>

      {items.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, index) => (
            <li
              key={item.kind === "saved" ? item.publicId : item.clientId}
              className="overflow-hidden rounded-lg border border-franja-border bg-white"
            >
              <img
                src={previewUrls[index]}
                alt=""
                className="h-28 w-full object-cover"
                width={200}
                height={112}
              />
              <div className="flex flex-wrap gap-1 p-2">
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  onClick={() => onMoveUp(index)}
                  aria-label="Subir imagen"
                  className="rounded border border-franja-border px-2 py-1 text-xs font-bold text-franja-morada disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={disabled || index === items.length - 1}
                  onClick={() => onMoveDown(index)}
                  aria-label="Bajar imagen"
                  className="rounded border border-franja-border px-2 py-1 text-xs font-bold text-franja-morada disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onRemove(index)}
                  className="rounded border border-franja-border px-2 py-1 text-xs font-bold text-franja-error"
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 flex h-24 items-center justify-center rounded-lg border border-dashed border-franja-border bg-franja-surface text-sm text-franja-muted">
          Sin imágenes en la galería
        </div>
      )}

      <label className="mt-3 inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada hover:bg-franja-surface disabled:opacity-50">
        Agregar imágenes
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          disabled={disabled || remaining <= 0}
          onChange={(event) => {
            onAddFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {remaining <= 0 ? (
        <p className="mt-2 text-[13px] text-franja-muted">
          Alcanzaste el máximo de {GALERIA_MAX} imágenes.
        </p>
      ) : null}
      {galleryError ? (
        <p className="mt-2 text-sm text-franja-error" role="alert">
          {galleryError}
        </p>
      ) : null}
    </div>
  );
}
