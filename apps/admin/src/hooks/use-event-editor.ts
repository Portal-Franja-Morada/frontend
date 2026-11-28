import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { DataState, EditorUiState } from "../lib/data-state";
import { readEditorUiPreview, readPreviewDataState } from "../lib/data-state";
import { getApiBaseUrl } from "../lib/api";
import { formatLastSavedTime } from "../lib/dates";
import {
  argentinaLocalToIso,
  isFinBeforeInicio,
  isoToArgentinaDate,
  isoToArgentinaTime,
} from "../lib/event-datetime";
import {
  createEvent,
  fetchAdminEventById,
  publishEvent,
  updateEvent,
} from "../lib/events-api";
import type {
  AdminEvent,
  ContentEstado,
  GaleriaImagen,
} from "../types/content";
import { useEditorGallery } from "./use-editor-gallery";
import { useEditorImage } from "./use-editor-image";
import { useUnsavedImageGuard } from "./use-unsaved-image-guard";

type EventEditorMode = "create" | "edit";

type FormState = {
  titulo: string;
  descripcion: string;
  lugar: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  imagenUrl: string | null;
  imagenPublicId: string | null;
};

const emptyForm: FormState = {
  titulo: "",
  descripcion: "",
  lugar: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
  imagenUrl: null,
  imagenPublicId: null,
};

function eventToForm(event: AdminEvent): FormState {
  return {
    titulo: event.titulo,
    descripcion: event.descripcion,
    lugar: event.lugar,
    fecha: isoToArgentinaDate(event.inicio),
    horaInicio: isoToArgentinaTime(event.inicio),
    horaFin: event.fin ? isoToArgentinaTime(event.fin) : "",
    imagenUrl: event.imagenUrl,
    imagenPublicId: event.imagenPublicId,
  };
}

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

function buildPayload(form: FormState, galeria: GaleriaImagen[]) {
  const inicio = argentinaLocalToIso(form.fecha, form.horaInicio);
  const fin = form.horaFin
    ? argentinaLocalToIso(form.fecha, form.horaFin)
    : null;
  return {
    titulo: form.titulo.trim(),
    descripcion: form.descripcion.trim(),
    lugar: form.lugar.trim(),
    inicio,
    fin,
    imagenUrl: form.imagenUrl,
    imagenPublicId: form.imagenPublicId,
    galeria,
  };
}

function validateForDraft(form: FormState): boolean {
  return Boolean(
    form.titulo.trim() &&
    form.descripcion.trim() &&
    form.lugar.trim() &&
    form.fecha &&
    form.horaInicio,
  );
}

function validateForPublish(form: FormState, hasImage: boolean): boolean {
  if (!validateForDraft(form) || !hasImage) {
    return false;
  }
  if (isFinBeforeInicio(form.fecha, form.horaInicio, form.horaFin)) {
    return false;
  }
  return true;
}

export function useEventEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const mode: EventEditorMode = id ? "edit" : "create";

  const previewDataState = readPreviewDataState();
  const previewUi = readEditorUiPreview();

  const seeded = (location.state as { event?: AdminEvent } | null)?.event;
  const [eventId, setEventId] = useState<string | null>(id ?? null);
  const [estado, setEstado] = useState<ContentEstado>("borrador");
  const [form, setForm] = useState<FormState>(() =>
    seeded && seeded.id === id ? eventToForm(seeded) : emptyForm,
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    seeded?.updatedAt ? new Date(seeded.updatedAt) : null,
  );
  const [fetchState, setFetchState] = useState<"loading" | "error" | "ok">(
    mode === "edit" && getApiBaseUrl() ? "loading" : "ok",
  );
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uiState, setUiState] = useState<EditorUiState>(previewUi);
  const [showValidation, setShowValidation] = useState(
    previewUi === "validacion",
  );
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    imageError,
    saveError,
    previewUrl,
    hasUnsavedImage,
    hasImage: hasSelectedImage,
    handleImageSelect,
    handleRemoveImage,
    ensureImageUploaded,
    markSaveFailed,
    clearSaveError,
  } = useEditorImage("evento");

  const {
    items: galleryItems,
    previewUrls: galleryPreviewUrls,
    galleryError,
    hasUnsavedGallery,
    setFromSaved: setGalleryFromSaved,
    addFiles: addGalleryFiles,
    removeAt: removeGalleryAt,
    move: moveGalleryItem,
    ensureGalleryUploaded,
    markGalleryCommitted,
    clearGalleryError,
  } = useEditorGallery("evento");

  const { confirmLeave } = useUnsavedImageGuard(
    (hasUnsavedImage || hasUnsavedGallery) && !previewDataState,
  );

  const applyImageFields = useCallback((patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const loadEvent = useCallback(async () => {
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
      const event = await fetchAdminEventById(id);
      if (!event) {
        setNotFound(true);
        setFetchState("ok");
        return;
      }
      setEventId(event.id);
      setEstado(event.estado);
      setForm(eventToForm(event));
      setGalleryFromSaved(event.galeria ?? []);
      setLastSavedAt(new Date(event.updatedAt));
      setFetchState("ok");
    } catch {
      setFetchState("error");
    }
  }, [id, mode, setGalleryFromSaved]);

  useEffect(() => {
    if (previewDataState) {
      return;
    }
    void loadEvent();
  }, [loadEvent, previewDataState]);

  useEffect(() => {
    if (seeded && seeded.id === id) {
      setGalleryFromSaved(seeded.galeria ?? []);
    }
  }, [id, seeded, setGalleryFromSaved]);

  const applyForm = useCallback((patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const imageReady = hasSelectedImage(form);

  const persistDraft = useCallback(async (): Promise<AdminEvent | null> => {
    if (!validateForDraft(form)) {
      setShowValidation(true);
      return null;
    }
    if (isFinBeforeInicio(form.fecha, form.horaInicio, form.horaFin)) {
      setShowValidation(true);
      return null;
    }
    setBusy(true);
    clearSaveError();
    clearGalleryError();
    try {
      const formForSave = await ensureImageUploaded(form, applyImageFields);
      if (!formForSave) {
        return null;
      }
      const galeriaForSave = await ensureGalleryUploaded();
      if (galeriaForSave === null) {
        return null;
      }

      const payload = buildPayload({ ...form, ...formForSave }, galeriaForSave);
      if (eventId) {
        const event = await updateEvent(eventId, payload);
        setGalleryFromSaved(event.galeria ?? []);
        markGalleryCommitted();
        setLastSavedAt(new Date(event.updatedAt));
        setEstado(event.estado);
        return event;
      }
      const event = await createEvent(payload);
      setEventId(event.id);
      setGalleryFromSaved(event.galeria ?? []);
      markGalleryCommitted();
      setLastSavedAt(new Date(event.updatedAt));
      setEstado(event.estado);
      navigate(`/eventos/${event.id}/editar`, {
        replace: true,
        state: { event },
      });
      return event;
    } catch {
      markSaveFailed();
      return null;
    } finally {
      setBusy(false);
    }
  }, [
    applyImageFields,
    clearGalleryError,
    clearSaveError,
    ensureGalleryUploaded,
    ensureImageUploaded,
    eventId,
    form,
    markGalleryCommitted,
    markSaveFailed,
    navigate,
    setGalleryFromSaved,
  ]);

  const handleSaveDraft = useCallback(() => {
    void persistDraft();
  }, [persistDraft]);

  const handlePublishClick = useCallback(() => {
    if (!validateForPublish(form, imageReady)) {
      setShowValidation(true);
      return;
    }
    setUiState("confirmar");
  }, [form, imageReady]);

  const handlePublishConfirm = useCallback(async () => {
    if (!validateForPublish(form, imageReady)) {
      setUiState(null);
      setShowValidation(true);
      return;
    }
    setBusy(true);
    clearSaveError();
    clearGalleryError();
    try {
      const formForSave = await ensureImageUploaded(form, applyImageFields);
      if (!formForSave || !formForSave.imagenUrl) {
        setUiState(null);
        setShowValidation(true);
        return;
      }
      const galeriaForSave = await ensureGalleryUploaded();
      if (galeriaForSave === null) {
        setUiState(null);
        return;
      }

      const payload = buildPayload({ ...form, ...formForSave }, galeriaForSave);
      let currentId = eventId;
      if (!currentId) {
        const created = await createEvent(payload);
        currentId = created.id;
        setEventId(created.id);
        setGalleryFromSaved(created.galeria ?? []);
        markGalleryCommitted();
        navigate(`/eventos/${created.id}/editar`, {
          replace: true,
          state: { event: created },
        });
      } else {
        const updated = await updateEvent(currentId, payload);
        setGalleryFromSaved(updated.galeria ?? []);
        markGalleryCommitted();
        setLastSavedAt(new Date(updated.updatedAt));
      }
      const published = await publishEvent(currentId);
      setEstado(published.estado);
      setLastSavedAt(new Date(published.updatedAt));
      setUiState("listo");
    } catch {
      markSaveFailed();
      setUiState(null);
    } finally {
      setBusy(false);
    }
  }, [
    applyImageFields,
    clearGalleryError,
    clearSaveError,
    ensureGalleryUploaded,
    ensureImageUploaded,
    eventId,
    form,
    imageReady,
    markGalleryCommitted,
    markSaveFailed,
    navigate,
    setGalleryFromSaved,
  ]);

  const handleImageChange = useCallback(
    (file: File | null) => {
      handleImageSelect(file);
    },
    [handleImageSelect],
  );

  const handleClearImage = useCallback(() => {
    handleRemoveImage(applyImageFields);
  }, [applyImageFields, handleRemoveImage]);

  const handleCancelNavigate = useCallback(
    (event: { preventDefault: () => void }) => {
      if (!hasUnsavedImage && !hasUnsavedGallery) {
        return;
      }
      event.preventDefault();
      if (confirmLeave()) {
        navigate("/eventos");
      }
    },
    [confirmLeave, hasUnsavedGallery, hasUnsavedImage, navigate],
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
    imageError,
    saveError,
    galleryError,
    galleryItems,
    galleryPreviewUrls,
    imagePreviewUrl: previewUrl(form.imagenUrl),
    hasImage: imageReady,
    addGalleryFiles,
    removeGalleryAt,
    moveGalleryUp: (index: number) => moveGalleryItem(index, -1),
    moveGalleryDown: (index: number) => moveGalleryItem(index, 1),
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
    handleClearImage,
    handleCancelNavigate,
    retry,
  };
}
