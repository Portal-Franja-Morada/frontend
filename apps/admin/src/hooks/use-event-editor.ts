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
import { uploadImage, validateImageFile } from "../lib/upload-api";
import type { AdminEvent, ContentEstado } from "../types/content";

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

function buildPayload(form: FormState) {
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

function validateForPublish(form: FormState): boolean {
  if (!validateForDraft(form) || !form.imagenUrl) {
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uiState, setUiState] = useState<EditorUiState>(previewUi);
  const [showValidation, setShowValidation] = useState(
    previewUi === "validacion",
  );
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

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
      setLastSavedAt(new Date(event.updatedAt));
      setFetchState("ok");
    } catch {
      setFetchState("error");
    }
  }, [id, mode]);

  useEffect(() => {
    if (previewDataState) {
      return;
    }
    void loadEvent();
  }, [loadEvent, previewDataState]);

  const applyForm = useCallback((patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const persistDraft = useCallback(async (): Promise<AdminEvent | null> => {
    if (!validateForDraft(form)) {
      setShowValidation(true);
      return null;
    }
    if (isFinBeforeInicio(form.fecha, form.horaInicio, form.horaFin)) {
      setShowValidation(true);
      return null;
    }
    const payload = buildPayload(form);
    setBusy(true);
    try {
      if (eventId) {
        const event = await updateEvent(eventId, payload);
        setLastSavedAt(new Date(event.updatedAt));
        setEstado(event.estado);
        return event;
      }
      const event = await createEvent(payload);
      setEventId(event.id);
      setLastSavedAt(new Date(event.updatedAt));
      setEstado(event.estado);
      navigate(`/eventos/${event.id}/editar`, {
        replace: true,
        state: { event },
      });
      return event;
    } finally {
      setBusy(false);
    }
  }, [eventId, form, navigate]);

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
      let currentId = eventId;
      if (!currentId) {
        const created = await createEvent(payload);
        currentId = created.id;
        setEventId(created.id);
        navigate(`/eventos/${created.id}/editar`, {
          replace: true,
          state: { event: created },
        });
      } else {
        const updated = await updateEvent(currentId, payload);
        setLastSavedAt(new Date(updated.updatedAt));
      }
      const published = await publishEvent(currentId);
      setEstado(published.estado);
      setLastSavedAt(new Date(published.updatedAt));
      setUiState("listo");
    } catch {
      setUiState(null);
      setFetchState("error");
    } finally {
      setBusy(false);
    }
  }, [eventId, form, navigate]);

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
          const result = await uploadImage(file);
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
  };
}
