import { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";
import { OptimizedImage } from "./OptimizedImage";

type ContentGalleryProps = {
  images: string[];
  alt: string;
};

export function ContentGallery({ images, alt }: ContentGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  const activeImage = activeIndex === null ? null : images[activeIndex];

  return (
    <>
      <section className="flex flex-col gap-4" aria-label="Galería de imágenes">
        <h2 className="text-sm font-bold text-franja-dark">Galería</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => (
            <li key={`${url}-${index}`}>
              <button
                type="button"
                className="block w-full overflow-hidden rounded-lg border border-franja-border"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver imagen ${index + 1} de ${images.length}`}
              >
                <OptimizedImage
                  src={url}
                  alt=""
                  layout="gallery"
                  className="aspect-square w-full object-cover transition-opacity hover:opacity-90"
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {activeImage ? (
        <ImageLightbox
          src={activeImage}
          alt={`${alt} — imagen ${(activeIndex ?? 0) + 1}`}
          onClose={() => setActiveIndex(null)}
        />
      ) : null}
    </>
  );
}
