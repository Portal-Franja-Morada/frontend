import { useCallback, useMemo, useState } from "react";
import { ApiError, isNetworkError } from "../lib/api";
import { getLandingSiteUrl } from "../lib/constants";
import { deleteMyAccount, downloadMyData } from "../lib/me-api";
import { readMisDatosDevState } from "../lib/mis-datos-dev-state";

export function useMisDatosPage() {
  const devState = useMemo(
    () => (import.meta.env.DEV ? readMisDatosDevState() : null),
    [],
  );

  const [downloading, setDownloading] = useState(devState === "descargando");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(
    devState === "modal-baja" || devState === "contrasena-incorrecta",
  );
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(
    devState === "contrasena-incorrecta" ? "Contraseña incorrecta" : null,
  );
  const [deleting, setDeleting] = useState(false);

  const download = useCallback(async () => {
    if (devState) {
      setDownloading(true);
      window.setTimeout(() => setDownloading(false), 1500);
      return;
    }

    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadMyData();
    } catch (error) {
      if (isNetworkError(error)) {
        setDownloadError("No pudimos preparar el archivo. Probá de nuevo.");
      } else if (error instanceof ApiError) {
        setDownloadError(error.message);
      } else {
        setDownloadError("No pudimos preparar el archivo. Probá de nuevo.");
      }
    } finally {
      setDownloading(false);
    }
  }, [devState]);

  const confirmDelete = useCallback(async () => {
    if (devState === "contrasena-incorrecta") return;
    if (devState) {
      setDeleting(true);
      window.setTimeout(() => {
        window.location.href = `${getLandingSiteUrl()}/?cuenta=baja`;
      }, 800);
      return;
    }

    if (!password.trim()) {
      setDeleteError("Escribila para confirmar.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount(password);
      window.location.href = `${getLandingSiteUrl()}/?cuenta=baja`;
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setDeleteError("Contraseña incorrecta");
      } else if (isNetworkError(error)) {
        setDeleteError("No pudimos dar de baja tu cuenta. Probá de nuevo.");
      } else if (error instanceof ApiError) {
        setDeleteError(error.message);
      } else {
        setDeleteError("No pudimos dar de baja tu cuenta. Probá de nuevo.");
      }
      setDeleting(false);
    }
  }, [devState, password]);

  const openDelete = useCallback(() => {
    setPassword("");
    setDeleteError(null);
    setDeleteOpen(true);
  }, []);

  const closeDelete = useCallback(() => {
    if (deleting) return;
    setDeleteOpen(false);
    setPassword("");
    setDeleteError(null);
  }, [deleting]);

  return {
    devState,
    downloading,
    downloadError,
    download,
    deleteOpen,
    openDelete,
    closeDelete,
    password,
    setPassword,
    deleteError,
    deleting,
    confirmDelete,
  };
}
