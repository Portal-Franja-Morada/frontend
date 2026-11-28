import { useCallback, useEffect, useRef, useState } from "react";
import {
  uploadImage,
  validateImageFile,
  type UploadTipo,
} from "../lib/upload-api";

export const GALERIA_MAX = 10;

export type GaleriaSavedItem = {
  url: string;
  publicId: string;
};

export type GaleriaEditorItem =
  | ({ kind: "saved" } & GaleriaSavedItem)
  | {
      kind: "pending";
      clientId: string;
      file: File;
      previewUrl: string;
    };

function nextClientId() {
  return crypto.randomUUID();
}

export function useEditorGallery(tipo: UploadTipo) {
  const [items, setItems] = useState<GaleriaEditorItem[]>([]);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [galleryDirty, setGalleryDirty] = useState(false);
  const pendingPreviewsRef = useRef<Set<string>>(new Set());

  const trackPreview = useCallback((url: string) => {
    pendingPreviewsRef.current.add(url);
  }, []);

  const revokePreview = useCallback((url: string) => {
    if (!pendingPreviewsRef.current.has(url)) {
      return;
    }
    URL.revokeObjectURL(url);
    pendingPreviewsRef.current.delete(url);
  }, []);

  const revokeAllPreviews = useCallback(() => {
    for (const url of pendingPreviewsRef.current) {
      URL.revokeObjectURL(url);
    }
    pendingPreviewsRef.current.clear();
  }, []);

  useEffect(() => () => revokeAllPreviews(), [revokeAllPreviews]);

  const hasPendingItems = items.some((item) => item.kind === "pending");
  const hasUnsavedGallery = galleryDirty || hasPendingItems;

  const setFromSaved = useCallback(
    (saved: GaleriaSavedItem[]) => {
      revokeAllPreviews();
      setItems(saved.map((item) => ({ kind: "saved" as const, ...item })));
      setGalleryDirty(false);
      setGalleryError(null);
    },
    [revokeAllPreviews],
  );

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) {
        return;
      }
      const files = Array.from(fileList);
      setGalleryError(null);

      setItems((current) => {
        if (current.length + files.length > GALERIA_MAX) {
          setGalleryError(
            `Podés agregar hasta ${GALERIA_MAX} imágenes en la galería.`,
          );
          return current;
        }

        const next = [...current];
        for (const file of files) {
          const validation = validateImageFile(file);
          if (validation) {
            setGalleryError(validation);
            return current;
          }
          const previewUrl = URL.createObjectURL(file);
          trackPreview(previewUrl);
          next.push({
            kind: "pending",
            clientId: nextClientId(),
            file,
            previewUrl,
          });
        }
        return next;
      });
      setGalleryDirty(true);
    },
    [trackPreview],
  );

  const removeAt = useCallback(
    (index: number) => {
      setGalleryError(null);
      setItems((current) => {
        const target = current[index];
        if (!target) {
          return current;
        }
        if (target.kind === "pending") {
          revokePreview(target.previewUrl);
        }
        return current.filter((_, itemIndex) => itemIndex !== index);
      });
      setGalleryDirty(true);
    },
    [revokePreview],
  );

  const move = useCallback((index: number, direction: -1 | 1) => {
    setItems((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }
      const next = [...current];
      const [moved] = next.splice(index, 1);
      if (!moved) {
        return current;
      }
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setGalleryDirty(true);
  }, []);

  const ensureGalleryUploaded = useCallback(async (): Promise<
    GaleriaSavedItem[] | null
  > => {
    const uploaded: GaleriaSavedItem[] = [];
    const nextItems: GaleriaEditorItem[] = [];

    for (const item of items) {
      if (item.kind === "saved") {
        uploaded.push({ url: item.url, publicId: item.publicId });
        nextItems.push(item);
        continue;
      }

      try {
        const result = await uploadImage(item.file, tipo);
        revokePreview(item.previewUrl);
        uploaded.push(result);
        nextItems.push({
          kind: "saved",
          url: result.url,
          publicId: result.publicId,
        });
      } catch (error) {
        setGalleryError(
          error instanceof Error
            ? error.message
            : "No pudimos subir una imagen de la galería.",
        );
        return null;
      }
    }

    setItems(nextItems);
    return uploaded;
  }, [items, revokePreview, tipo]);

  const markGalleryCommitted = useCallback(() => {
    setGalleryDirty(false);
  }, []);

  const clearGalleryError = useCallback(() => {
    setGalleryError(null);
  }, []);

  const previewUrls = items.map((item) =>
    item.kind === "saved" ? item.url : item.previewUrl,
  );

  return {
    items,
    previewUrls,
    galleryError,
    hasUnsavedGallery,
    setFromSaved,
    addFiles,
    removeAt,
    move,
    ensureGalleryUploaded,
    markGalleryCommitted,
    clearGalleryError,
  };
}
