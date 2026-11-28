import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { ContentActionToast } from "../components/ContentActionToast";
import { DeleteContentDialog } from "../components/DeleteContentDialog";
import { EditorGallerySection } from "../components/EditorGallerySection";
import { MarkdownToolbar } from "../components/MarkdownToolbar";
import {
  PublishConfirmOverlay,
  PublishSuccessBanner,
  ValidationOverlay,
} from "../components/PostEditorOverlays";
import { PostEditorPreview } from "../components/PostEditorPreview";
import { PostStatusBadge } from "../components/PostStatusBadge";
import { useDeleteContent } from "../hooks/use-delete-content";
import { usePostEditor } from "../hooks/use-post-editor";

const fieldClassName =
  "h-14 w-full rounded-lg border border-franja-border bg-white px-4 text-base text-franja-dark outline-none transition-colors placeholder:text-franja-muted focus:border-franja-morada";

export function NovedadEditorPage() {
  const navigate = useNavigate();
  const { id: routePostId } = useParams<{ id: string }>();
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
  } = usePostEditor();

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
    kind: "post",
    onDeleted: () => {
      const label = form.titulo.trim() || "Sin título";
      navigate("/novedades", {
        state: { deletedToast: `Eliminamos «${label}».` },
      });
    },
    onRefresh: () => {
      navigate("/novedades");
    },
  });

  const formBusy = busy || deleting;
  const isCreate = mode === "create";
  const heading = isCreate ? "CREAR NOVEDAD" : "EDITAR NOVEDAD";
  const breadcrumbTail = isCreate ? "Nueva publicación" : "Editar publicación";

  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-8 px-5 py-8 lg:px-10 lg:py-10">
        <nav aria-label="Recorrido" className="text-[13px] text-franja-muted">
          <Link to="/novedades" className="hover:text-franja-morada">
            Administración / Novedades
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
          <EmptyState message="No encontramos esta novedad." />
        ) : null}
        {dataState === "error" ? <ErrorState onRetry={retry} /> : null}

        {dataState === "ok" ? (
          <>
            {showSuccess ? <PublishSuccessBanner /> : null}
            {showValidationPanel ? (
              <ValidationOverlay onBack={() => setShowValidation(false)} />
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
                      htmlFor="post-title"
                      className="text-sm font-bold text-franja-dark"
                    >
                      Título *
                    </label>
                    <input
                      id="post-title"
                      type="text"
                      value={form.titulo}
                      onChange={(event) =>
                        applyForm({ titulo: event.target.value })
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
                      htmlFor="post-body"
                      className="text-sm font-bold text-franja-dark"
                    >
                      Cuerpo de la novedad *
                    </label>
                    <div className="mt-2 overflow-hidden rounded-lg border border-franja-border">
                      <MarkdownToolbar
                        disabled={formBusy}
                        value={form.cuerpo}
                        selectionStart={selection.start}
                        selectionEnd={selection.end}
                        onInsert={(next, start, end) => {
                          applyForm({ cuerpo: next });
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
                        id="post-body"
                        rows={12}
                        value={form.cuerpo}
                        onChange={(event) =>
                          applyForm({ cuerpo: event.target.value })
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
                    {formBusy ? "Guardando…" : "Publicar novedad"}
                  </button>
                  <button
                    type="button"
                    disabled={formBusy}
                    onClick={handleSaveDraft}
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-franja-border bg-white px-5 text-sm font-bold text-franja-morada transition-colors hover:bg-franja-surface disabled:opacity-50"
                  >
                    {formBusy ? "Guardando…" : "Guardar borrador"}
                  </button>
                  {!isCreate && routePostId ? (
                    <button
                      type="button"
                      disabled={formBusy}
                      onClick={() => openDelete(routePostId, form.titulo)}
                      className="inline-flex h-12 items-center justify-center rounded-lg border border-franja-error/40 bg-white px-5 text-sm font-bold text-franja-error transition-colors hover:bg-franja-error/5 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  ) : null}
                </div>

                <Link
                  to="/novedades"
                  onClick={handleCancelNavigate}
                  className="mt-4 inline-block text-sm font-bold text-franja-morada"
                >
                  Cancelar y volver al listado
                </Link>
              </section>

              <PostEditorPreview
                titulo={form.titulo}
                cuerpo={form.cuerpo}
                imagenUrl={imagePreviewUrl}
              />
            </div>
          </>
        ) : null}
      </main>

      {confirmOpen ? (
        <PublishConfirmOverlay
          busy={formBusy}
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
