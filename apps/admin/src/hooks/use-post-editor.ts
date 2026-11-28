import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { DataState, EditorUiState } from "../lib/data-state";
import { readEditorUiPreview, readPreviewDataState } from "../lib/data-state";
import { getApiBaseUrl } from "../lib/api";
import { formatLastSavedTime } from "../lib/dates";
import { deriveResumen } from "../lib/resumen";
import {
  createPost,
  fetchAdminPostById,
  publishPost,
  updatePost,
} from "../lib/posts-api";
import { uploadImage, validateImageFile } from "../lib/upload-api";
import type { AdminPost, ContentEstado } from "../types/content";

type PostEditorMode = "create" | "edit";

type FormState = {
  titulo: string;
  cuerpo: string;
  imagenUrl: string | null;
  imagenPublicId: string | null;
};

const emptyForm: FormState = {
  titulo: "",
  cuerpo: "",
  imagenUrl: null,
  imagenPublicId: null,
};

function resolveDataState(
  preview: DataState | null,
  fetchState: "loading" | "error" | "ok",
  notFound: boolean,
): DataState {
  if (preview) {
    return preview;
  }
  if (fetchState === "loading") {
    return "cargando";
  }
  if (fetchState === "error") {
    return "error";
  }
  if (notFound) {
    return "vacio";
  }
  return "ok";
}

function buildPayload(form: FormState) {
  return {
    titulo: form.titulo.trim(),
    resumen: deriveResumen(form.cuerpo),
    cuerpo: form.cuerpo.trim(),
    imagenUrl: form.imagenUrl,
    imagenPublicId: form.imagenPublicId,
  };
}

function validateForDraft(form: FormState): boolean {
  return Boolean(form.titulo.trim() && form.cuerpo.trim());
}

function validateForPublish(form: FormState): boolean {
  return validateForDraft(form) && Boolean(form.imagenUrl);
}

export function usePostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const mode: PostEditorMode = id ? "edit" : "create";

  const previewDataState = readPreviewDataState();
  const previewUi = readEditorUiPreview();

  const seeded = (location.state as { post?: AdminPost } | null)?.post;
  const [postId, setPostId] = useState<string | null>(id ?? null);
  const [estado, setEstado] = useState<ContentEstado>("borrador");
  const [form, setForm] = useState<FormState>(() =>
    seeded && seeded.id === id
      ? {
          titulo: seeded.titulo,
          cuerpo: seeded.cuerpo,
          imagenUrl: seeded.imagenUrl,
          imagenPublicId: seeded.imagenPublicId,
        }
      : emptyForm,
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    seeded?.updatedAt ? new Date(seeded.updatedAt) : null,
  );
  const [fetchState, setFetchState] = useState<"loading" | "error" | "ok">(
    mode === "edit" && getApiBaseUrl() ? "loading" : "ok",
  );
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uiState, setUiState] = useState<EditorUiState>(previewUi);
  const [showValidation, setShowValidation] = useState(
    previewUi === "validacion",
  );
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const loadPost = useCallback(async () => {
    if (mode !== "edit" || !id) {
      return;
    }
    if (!getApiBaseUrl()) {
      setFetchState("error");
      return;
    }
    setFetchState("loading");
    setNotFound(false);
    try {
      const post = await fetchAdminPostById(id);
      if (!post) {
        setNotFound(true);
        setFetchState("ok");
        return;
      }
      setPostId(post.id);
      setEstado(post.estado);
      setForm({
        titulo: post.titulo,
        cuerpo: post.cuerpo,
        imagenUrl: post.imagenUrl,
        imagenPublicId: post.imagenPublicId,
      });
      setLastSavedAt(new Date(post.updatedAt));
      setFetchState("ok");
    } catch {
      setFetchState("error");
    }
  }, [id, mode]);

  useEffect(() => {
    if (previewDataState) {
      return;
    }
    void loadPost();
  }, [loadPost, previewDataState]);

  const applyForm = useCallback((patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const persistDraft = useCallback(async (): Promise<AdminPost | null> => {
    if (!validateForDraft(form)) {
      setShowValidation(true);
      return null;
    }
    const payload = buildPayload(form);
    setBusy(true);
    try {
      if (postId) {
        const post = await updatePost(postId, payload);
        setLastSavedAt(new Date(post.updatedAt));
        setEstado(post.estado);
        return post;
      }
      const post = await createPost(payload);
      setPostId(post.id);
      setLastSavedAt(new Date(post.updatedAt));
      setEstado(post.estado);
      navigate(`/novedades/${post.id}/editar`, {
        replace: true,
        state: { post },
      });
      return post;
    } finally {
      setBusy(false);
    }
  }, [form, navigate, postId]);

  const handleSaveDraft = useCallback(() => {
    void persistDraft();
  }, [persistDraft]);

  const handlePublishClick = useCallback(() => {
    if (!validateForPublish(form)) {
      setShowValidation(true);
      return;
    }
    setUiState("confirmar");
  }, [form]);

  const handlePublishConfirm = useCallback(async () => {
    if (!validateForPublish(form)) {
      setUiState(null);
      setShowValidation(true);
      return;
    }
    setBusy(true);
    try {
      const payload = buildPayload(form);
      let currentId = postId;
      if (!currentId) {
        const created = await createPost(payload);
        currentId = created.id;
        setPostId(created.id);
        navigate(`/novedades/${created.id}/editar`, {
          replace: true,
          state: { post: created },
        });
      } else {
        const updated = await updatePost(currentId, payload);
        setLastSavedAt(new Date(updated.updatedAt));
      }
      const published = await publishPost(currentId);
      setEstado(published.estado);
      setLastSavedAt(new Date(published.updatedAt));
      setUiState("listo");
    } catch {
      setUiState(null);
      setFetchState("error");
    } finally {
      setBusy(false);
    }
  }, [form, navigate, postId]);

  const handleImageChange = useCallback(
    (file: File | null) => {
      if (!file) {
        return;
      }
      const validation = validateImageFile(file);
      if (validation) {
        setUploadError(validation);
        return;
      }
      setUploadError(null);
      setUploadingImage(true);
      void (async () => {
        try {
          const result = await uploadImage(file, "novedad");
          applyForm({
            imagenUrl: result.url,
            imagenPublicId: result.publicId,
          });
        } catch (error) {
          setUploadError(
            error instanceof Error
              ? error.message
              : "No pudimos cargar la imagen.",
          );
        } finally {
          setUploadingImage(false);
        }
      })();
    },
    [applyForm],
  );

  const retry = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("estado");
    window.location.href = url.toString();
  }, []);

  const dataState = resolveDataState(previewDataState, fetchState, notFound);
  const confirmOpen = uiState === "confirmar" || previewUi === "confirmar";
  const showSuccess = uiState === "listo" || previewUi === "listo";
  const showValidationPanel = showValidation || previewUi === "validacion";

  return {
    mode,
    estado,
    form,
    applyForm,
    dataState,
    busy,
    uploadingImage,
    uploadError,
    lastSavedLabel: lastSavedAt
      ? `Guardado por última vez a las ${formatLastSavedTime(lastSavedAt)} h`
      : null,
    confirmOpen,
    showSuccess,
    showValidationPanel,
    setShowValidation,
    setUiState,
    selection,
    setSelection,
    bodyRef,
    handleSaveDraft,
    handlePublishClick,
    handlePublishConfirm,
    handleImageChange,
    retry,
    navigate,
  };
}
