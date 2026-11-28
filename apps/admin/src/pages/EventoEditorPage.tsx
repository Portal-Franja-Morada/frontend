import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { ContentActionToast } from "../components/ContentActionToast";
import { DeleteContentDialog } from "../components/DeleteContentDialog";
import { EditorGallerySection } from "../components/EditorGallerySection";
import { EventEditorPreview } from "../components/EventEditorPreview";
import { MarkdownToolbar } from "../components/MarkdownToolbar";
import {
  PublishConfirmOverlay,
  PublishSuccessBanner,
  ValidationOverlay,
} from "../components/PostEditorOverlays";
import { PostStatusBadge } from "../components/PostStatusBadge";
import { useDeleteContent } from "../hooks/use-delete-content";
import { useEventEditor } from "../hooks/use-event-editor";

const fieldClassName =
  "h-14 w-full rounded-lg border border-franja-border bg-white px-4 text-base text-franja-dark outline-none transition-colors placeholder:text-franja-muted focus:border-franja-morada";

const EVENT_VALIDATION_MESSAGE =
  "Elegí una fecha y completá el horario del evento.";

export function EventoEditorPage() {
  const navigate = useNavigate();
  const { id: routeEventId } = useParams<{ id: string }>();
  const {
    mode,
    estado,
    form,
    applyForm,
    dataState,
    busy,
    imageError,
    saveError,
    imagePreviewUrl,
    hasImage,
    lastSavedLabel,
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
    galleryError,
    galleryItems,
    galleryPreviewUrls,
    addGalleryFiles,
    removeGalleryAt,
    moveGalleryUp,
    moveGalleryDown,
    retry,
  } = useEventEditor();

  const {
    deleteOpen,
    deleteTitulo,
    deleting,
    dialogError,
    toast,
    openDelete,
    closeDelete,
    confirmDelete,
    dismissToast,
  } = useDeleteContent({
    kind: "event",
    onDeleted: () => {
      const label = form.titulo.trim() || "Sin título";
      navigate("/eventos", {
        state: { deletedToast: `Eliminamos «${label}».` },
      });
    },
    onRefresh: () => {
      navigate("/eventos");
    },
  });

  const formBusy = busy || deleting;
  const isCreate = mode === "create";
  const heading = isCreate ? "CREAR EVENTO" : "EDITAR EVENTO";
  const breadcrumbTail = isCreate ? "Nueva publicación" : "Editar evento";

  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-8 px-5 py-8 lg:px-10 lg:py-10">
        <nav aria-label="Recorrido" className="text-[13px] text-franja-muted">
          <Link to="/eventos" className="hover:text-franja-morada">
            Administración / Eventos
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{breadcrumbTail}</span>
        </nav>

        <div>
          <h1 className="text-[26px] font-bold text-franja-dark lg:text-[36px]">
            {heading}
          </h1>
          <p className="mt-2 text-base text-franja-muted">
            Completá la información y revisala antes de publicar.
          </p>
        </div>

        {dataState === "cargando" ? <LoadingState /> : null}
        {dataState === "vacio" ? (
          <EmptyState message="No encontramos este evento." />
        ) : null}
        {dataState === "error" ? <ErrorState onRetry={retry} /> : null}

        {dataState === "ok" ? (
          <>
            {showSuccess ? (
              <PublishSuccessBanner title="¡Evento publicado!" />
            ) : null}
            {showValidationPanel ? (
              <ValidationOverlay
                message={EVENT_VALIDATION_MESSAGE}
                onBack={() => setShowValidation(false)}
              />
            ) : null}

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_360px]">
              <section className="rounded-[10px] border border-franja-border bg-white p-5 lg:p-8">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <PostStatusBadge estado={estado} />
                  <p className="text-[13px] text-franja-muted">
                    Los campos con * son obligatorios.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="event-title"
                      className="text-sm font-bold text-franja-dark"
                    >
                      Título *
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={form.titulo}
                      onChange={(event) =>
                        applyForm({ titulo: event.target.value })
                      }
                      className={cn(fieldClassName, "mt-2")}
                      disabled={formBusy}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="event-date"
                        className="text-sm font-bold text-franja-dark"
                      >
                        Fecha *
                      </label>
                      <input
                        id="event-date"
                        type="date"
                        value={form.fecha}
                        onChange={(event) =>
                          applyForm({ fecha: event.target.value })
                        }
                        className={cn(fieldClassName, "mt-2")}
                        disabled={formBusy}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-franja-dark">
                        Horario *
                      </span>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="time"
                          value={form.horaInicio}
                          onChange={(event) =>
                            applyForm({ horaInicio: event.target.value })
                          }
                          className={fieldClassName}
                          disabled={formBusy}
                          aria-label="Hora de inicio"
                        />
                        <span className="text-sm text-franja-muted">a</span>
                        <input
                          type="time"
                          value={form.horaFin}
                          onChange={(event) =>
                            applyForm({ horaFin: event.target.value })
                          }
                          className={fieldClassName}
                          disabled={formBusy}
                          aria-label="Hora de fin"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="event-place"
                      className="text-sm font-bold text-franja-dark"
                    >
                      Lugar *
                    </label>
                    <input
                      id="event-place"
                      type="text"
                      value={form.lugar}
                      onChange={(event) =>
                        applyForm({ lugar: event.target.value })
                      }
                      className={cn(fieldClassName, "mt-2")}
                      disabled={formBusy}
                    />
                  </div>

                  <div>
                    <span className="text-sm font-bold text-franja-dark">
                      Imagen destacada *
                    </span>
                    {imagePreviewUrl ? (
                      <img
                        src={imagePreviewUrl}
                        alt=""
                        className="mt-2 h-[200px] w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="mt-2 flex h-[200px] items-center justify-center rounded-lg border border-dashed border-franja-border bg-franja-surface text-sm text-franja-muted">
                        Sin imagen seleccionada
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <label className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada hover:bg-franja-surface">
                        {hasImage ? "Cambiar imagen" : "Elegir imagen"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          disabled={formBusy}
                          onChange={(event) =>
                            handleImageChange(event.target.files?.[0] ?? null)
                          }
                        />
                      </label>
                      {hasImage ? (
                        <button
                          type="button"
                          disabled={formBusy}
                          onClick={handleClearImage}
                          className="inline-flex h-12 items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada hover:bg-franja-surface disabled:opacity-50"
                        >
                          Quitar imagen
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[13px] text-franja-muted">
                      JPG, PNG o WEBP · Hasta 2 MB
                      <br />
                      Recomendado: 1200 × 700 px
                      <br />
                      La imagen se sube al guardar o publicar.
                    </p>
                    {imageError ? (
                      <p
                        className="mt-2 text-sm text-franja-error"
                        role="alert"
                      >
                        {imageError}
                      </p>
                    ) : null}
                    {saveError ? (
                      <p
                        className="mt-2 text-sm text-franja-error"
                        role="alert"
                      >
                        {saveError}
                      </p>
                    ) : null}
                  </div>

                  <EditorGallerySection
                    items={galleryItems}
                    previewUrls={galleryPreviewUrls}
                    disabled={formBusy}
                    galleryError={galleryError}
                    onAddFiles={addGalleryFiles}
                    onRemove={removeGalleryAt}
                    onMoveUp={moveGalleryUp}
                    onMoveDown={moveGalleryDown}
                  />

                  <div>
                    <label
                      htmlFor="event-description"
                      className="text-sm font-bold text-franja-dark"
                    >
                      Descripción *
                    </label>
                    <div className="mt-2 overflow-hidden rounded-lg border border-franja-border">
                      <MarkdownToolbar
                        disabled={formBusy}
                        value={form.descripcion}
                        selectionStart={selection.start}
                        selectionEnd={selection.end}
                        onInsert={(next, start, end) => {
                          applyForm({ descripcion: next });
                          setSelection({ start, end });
                          requestAnimationFrame(() => {
                            const field = bodyRef.current;
                            if (field) {
                              field.focus();
                              field.setSelectionRange(start, end);
                            }
                          });
                        }}
                      />
                      <textarea
                        ref={bodyRef}
                        id="event-description"
                        rows={12}
                        value={form.descripcion}
                        onChange={(event) =>
                          applyForm({ descripcion: event.target.value })
                        }
                        onSelect={(event) => {
                          const target = event.currentTarget;
                          setSelection({
                            start: target.selectionStart,
                            end: target.selectionEnd,
                          });
                        }}
                        className="w-full resize-y border-0 bg-white px-4 py-3 text-base text-franja-dark outline-none"
                        disabled={formBusy}
                      />
                    </div>
                  </div>
                </div>

                {lastSavedLabel ? (
                  <p className="mt-6 text-[13px] text-franja-muted">
                    {lastSavedLabel}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    disabled={formBusy}
                    onClick={handlePublishClick}
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-5 text-sm font-bold text-white transition-colors hover:bg-franja-morada/90 disabled:opacity-50"
                  >
                    {formBusy ? "Guardando…" : "Publicar evento"}
                  </button>
                  <button
                    type="button"
                    disabled={formBusy}
                    onClick={handleSaveDraft}
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada transition-colors hover:bg-franja-surface disabled:opacity-50"
                  >
                    {formBusy ? "Guardando…" : "Guardar borrador"}
                  </button>
                  {!isCreate && routeEventId ? (
                    <button
                      type="button"
                      disabled={formBusy}
                      onClick={() => openDelete(routeEventId, form.titulo)}
                      className="inline-flex h-12 items-center justify-center rounded-lg border border-franja-error/40 bg-white px-5 text-sm font-bold text-franja-error transition-colors hover:bg-franja-error/5 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  ) : null}
                </div>

                <Link
                  to="/eventos"
                  onClick={handleCancelNavigate}
                  className="mt-4 inline-block text-sm font-bold text-franja-morada"
                >
                  Cancelar y volver al listado
                </Link>
              </section>

              <EventEditorPreview
                titulo={form.titulo}
                lugar={form.lugar}
                fecha={form.fecha}
                horaInicio={form.horaInicio}
                horaFin={form.horaFin}
                descripcion={form.descripcion}
                imagenUrl={imagePreviewUrl}
              />
            </div>
          </>
        ) : null}
      </main>

      {confirmOpen ? (
        <PublishConfirmOverlay
          busy={formBusy}
          title="¿PUBLICAMOS ESTA ACTIVIDAD?"
          message="Va a quedar visible para toda la comunidad. Revisá el título, la imagen y la fecha antes de continuar."
          onCancel={() => setUiState(null)}
          onConfirm={() => void handlePublishConfirm()}
        />
      ) : null}

      {deleteOpen ? (
        <DeleteContentDialog
          titulo={deleteTitulo}
          busy={deleting}
          error={dialogError}
          onCancel={closeDelete}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}

      {toast ? (
        <ContentActionToast message={toast} onDismiss={dismissToast} />
      ) : null}
    </AdminLayout>
  );
}
