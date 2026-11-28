import { useCallback, useEffect, useRef, useState } from "react";
import {
  uploadImage,
  validateImageFile,
  type UploadTipo,
} from "../lib/upload-api";

type ImageFields = {
  imagenUrl: string | null;
  imagenPublicId: string | null;
};

export function useEditorImage(tipo: UploadTipo) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setLocalPreviewUrl(null);
  }, []);

  useEffect(() => () => revokePreview(), [revokePreview]);

  const previewUrl = useCallback(
    (savedUrl: string | null) => localPreviewUrl ?? savedUrl,
    [localPreviewUrl],
  );

  const hasUnsavedImage = pendingFile !== null;

  const handleImageSelect = useCallback(
    (file: File | null) => {
      if (!file) {
        return;
      }
      const validation = validateImageFile(file);
      if (validation) {
        setImageError(validation);
        return;
      }
      setImageError(null);
      setSaveError(null);
      revokePreview();
      const url = URL.createObjectURL(file);
      previewRef.current = url;
      setLocalPreviewUrl(url);
      setPendingFile(file);
    },
    [revokePreview],
  );

  const handleRemoveImage = useCallback(
    (applyImageFields: (patch: ImageFields) => void) => {
      revokePreview();
      setPendingFile(null);
      setImageError(null);
      setSaveError(null);
      applyImageFields({ imagenUrl: null, imagenPublicId: null });
    },
    [revokePreview],
  );

  const ensureImageUploaded = useCallback(
    async (
      form: ImageFields,
      applyImageFields: (patch: ImageFields) => void,
    ): Promise<ImageFields | null> => {
      if (!pendingFile) {
        return form;
      }

      try {
        const result = await uploadImage(pendingFile, tipo);
        revokePreview();
        setPendingFile(null);
        const next: ImageFields = {
          imagenUrl: result.url,
          imagenPublicId: result.publicId,
        };
        applyImageFields(next);
        return { ...form, ...next };
      } catch (error) {
        setImageError(
          error instanceof Error
            ? error.message
            : "No pudimos subir la imagen.",
        );
        return null;
      }
    },
    [pendingFile, revokePreview, tipo],
  );

  const markSaveFailed = useCallback(() => {
    setSaveError("La imagen se subió pero no pudimos guardar. Probá de nuevo.");
  }, []);

  const clearSaveError = useCallback(() => {
    setSaveError(null);
  }, []);

  const hasImage = useCallback(
    (form: ImageFields) => Boolean(form.imagenUrl || pendingFile),
    [pendingFile],
  );

  return {
    imageError,
    saveError,
    previewUrl,
    hasUnsavedImage,
    hasImage,
    handleImageSelect,
    handleRemoveImage,
    ensureImageUploaded,
    markSaveFailed,
    clearSaveError,
  };
}
