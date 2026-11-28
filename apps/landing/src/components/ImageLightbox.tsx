import { useCallback, useEffect, useId, useRef } from "react";
import { OptimizedImage } from "./OptimizedImage";

type ImageLightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.code === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <h2 id={titleId} className="sr-only">
          {alt}
        </h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 text-sm font-bold text-white"
        >
          Cerrar
        </button>
        <OptimizedImage
          src={src}
          alt={alt}
          layout="detail"
          loading="eager"
          className="aspect-[960/400] max-h-[80vh] w-full rounded-xl object-contain"
        />
      </div>
    </div>
  );
}
