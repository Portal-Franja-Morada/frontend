import { useCallback, useMemo, useRef, useState } from "react";
import { ApiError, isNetworkError } from "../lib/api";
import {
  DEMO_APUNTES_IMPORT_RESULT,
  formatFileSize,
  importApuntesFile,
  validateApuntesFile,
} from "../lib/apuntes-api";
import { readApuntesImportDevState } from "../lib/apuntes-import-dev-state";
import type { ImportLinksResponse } from "../types/apuntes";

export function useAdminApuntesImportPage() {
  const devState = useMemo(() => readApuntesImportDevState(), []);
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(
    devState === "formato-invalido"
      ? new File([""], "apuntes.pdf", { type: "application/pdf" })
      : devState === "archivo-grande"
        ? new File([new ArrayBuffer(1_500_000)], "apuntes.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })
        : devState === "resultado"
          ? new File([""], "apuntes.csv", { type: "text/csv" })
          : null,
  );
  const [fileError, setFileError] = useState<string | null>(() => {
    if (devState === "formato-invalido") {
      return "Formato no soportado, subí un CSV o Excel.";
    }
    if (devState === "archivo-grande") {
      return "El archivo pesa más de 1 MB.";
    }
    return null;
  });
  const [importing, setImporting] = useState(devState === "importando");
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportLinksResponse | null>(
    devState === "resultado" ? DEMO_APUNTES_IMPORT_RESULT : null,
  );
  const [dragOver, setDragOver] = useState(false);

  const pickFile = useCallback((next: File | null) => {
    if (!next) {
      setFile(null);
      setFileError(null);
      setImportError(null);
      return;
    }
    const validation = validateApuntesFile(next);
    setFile(next);
    setFileError(validation);
    setImportError(null);
    setResult(null);
  }, []);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onInputChange = useCallback(
    (list: FileList | null) => {
      pickFile(list?.[0] ?? null);
    },
    [pickFile],
  );

  const importFile = useCallback(async () => {
    if (!file || fileError) return;

    if (devState) {
      if (devState === "importando") return;
      if (devState === "formato-invalido" || devState === "archivo-grande") {
        return;
      }
      setImporting(true);
      window.setTimeout(() => {
        setImporting(false);
        setResult(DEMO_APUNTES_IMPORT_RESULT);
      }, 1200);
      return;
    }

    setImporting(true);
    setImportError(null);
    try {
      const data = await importApuntesFile(file);
      setResult(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setImportError(error.message);
      } else if (isNetworkError(error)) {
        setImportError("No pudimos importar los apuntes. Probá de nuevo.");
      } else if (error instanceof Error) {
        setImportError(error.message);
      } else {
        setImportError("No pudimos importar los apuntes. Probá de nuevo.");
      }
    } finally {
      setImporting(false);
    }
  }, [devState, file, fileError]);

  const canImport = Boolean(file) && !fileError && !importing;

  const fileLabel = file
    ? `${file.name}${file.size > 0 ? ` · ${formatFileSize(file.size)}` : ""}`
    : null;

  return {
    inputRef,
    file,
    fileLabel,
    fileError,
    importError,
    importing,
    result,
    dragOver,
    setDragOver,
    canImport,
    openPicker,
    onInputChange,
    pickFile,
    importFile,
  };
}
