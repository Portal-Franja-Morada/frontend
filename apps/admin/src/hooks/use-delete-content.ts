import { useCallback, useState } from "react";
import { ApiError } from "../lib/api";
import { deleteEvent } from "../lib/events-api";
import { deletePost } from "../lib/posts-api";

export type ContentDeleteKind = "post" | "event";

type DeleteTarget = {
  id: string;
  titulo: string;
};

type UseDeleteContentOptions = {
  kind: ContentDeleteKind;
  onDeleted: (id: string) => void;
  onRefresh: () => void;
};

function resolveDeleteError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "No pudimos eliminar. Probá de nuevo.";
}

export function useDeleteContent({
  kind,
  onDeleted,
  onRefresh,
}: UseDeleteContentOptions) {
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const openDelete = useCallback((id: string, titulo: string) => {
    setDialogError(null);
    setTarget({ id, titulo: titulo.trim() || "Sin título" });
  }, []);

  const closeDelete = useCallback(() => {
    if (deleting) {
      return;
    }
    setTarget(null);
    setDialogError(null);
  }, [deleting]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!target) {
      return;
    }
    setDeleting(true);
    setDialogError(null);
    try {
      if (kind === "post") {
        await deletePost(target.id);
      } else {
        await deleteEvent(target.id);
      }
      const label = target.titulo;
      const deletedId = target.id;
      setTarget(null);
      setToast(`Eliminamos «${label}».`);
      onDeleted(deletedId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setTarget(null);
        setToast("Este contenido ya no existe.");
        onRefresh();
        return;
      }
      setDialogError(resolveDeleteError(error));
    } finally {
      setDeleting(false);
    }
  }, [kind, onDeleted, onRefresh, target]);

  return {
    deleteOpen: target !== null,
    deleteTitulo: target?.titulo ?? "",
    deleting,
    dialogError,
    toast,
    openDelete,
    closeDelete,
    confirmDelete,
    dismissToast,
    showToast: setToast,
  };
}
