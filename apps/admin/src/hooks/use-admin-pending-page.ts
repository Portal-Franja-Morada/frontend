import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError, getApiBaseUrl, isNetworkError } from "../lib/api";
import { DEMO_PENDING } from "../lib/pending-demo";
import { readPendingDevState } from "../lib/pending-dev-state";
import {
  aplicarDiferenciaPadron,
  corregirIdentidad,
  descartarDiferenciaPadron,
  fetchAdminPending,
} from "../lib/usuarios-api";
import { buildCorregirBody } from "../components/CorregirNombreDialog";
import type { PendingResponse } from "../types/usuarios";

export type PendingTab = "verificacion" | "diferencias";

type FetchStatus = "idle" | "loading" | "error" | "ok";

const EMPTY_PENDING: PendingResponse = {
  verificacion: { total: 0, items: [] },
  diferenciasPadron: { total: 0, items: [] },
};

function readTab(search: string): PendingTab {
  const tab = new URLSearchParams(search).get("tab");
  return tab === "diferencias" ? "diferencias" : "verificacion";
}

export function useAdminPendingPage() {
  const devState = useMemo(() => readPendingDevState(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = readTab(searchParams.toString());

  const [data, setData] = useState<PendingResponse>(() => {
    if (!devState) return EMPTY_PENDING;
    if (devState === "vacio") return EMPTY_PENDING;
    if (devState === "cargando" || devState === "error") return EMPTY_PENDING;
    return DEMO_PENDING;
  });
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(
    devState === "cargando"
      ? "loading"
      : devState === "error"
        ? "error"
        : devState
          ? "ok"
          : getApiBaseUrl()
            ? "loading"
            : "error",
  );

  const [savedBanner, setSavedBanner] = useState(devState === "guardado-ok");
  const [resolvedNotice, setResolvedNotice] = useState<{
    dni: string;
    perfil: string;
    padron: string;
  } | null>(
    devState === "diferencia-resuelta"
      ? {
          dni: "40111010",
          perfil: "Sofía Maidana",
          padron: "Sofía Belén Maidana",
        }
      : null,
  );

  const [dialogOpen, setDialogOpen] = useState(
    devState === "modal-corregir" || devState === "sin-cambios",
  );
  const [dialogUserId, setDialogUserId] = useState<string | null>(
    devState === "modal-corregir" || devState === "sin-cambios"
      ? DEMO_PENDING.diferenciasPadron.items[0]!.userId
      : null,
  );
  const [dialogDni, setDialogDni] = useState(devState ? "40111010" : "");
  const [dialogNombre, setDialogNombre] = useState(
    devState === "sin-cambios" ? "Sofía Belén" : "Sofía Belén",
  );
  const [dialogApellido, setDialogApellido] = useState("Maidana");
  const [dialogMotivo, setDialogMotivo] = useState(
    devState === "sin-cambios" ? "Coincide con el padrón." : "",
  );
  const [initialNombre, setInitialNombre] = useState("Sofía");
  const [initialApellido, setInitialApellido] = useState("Maidana");
  const [dialogError, setDialogError] = useState<string | null>(
    devState === "sin-cambios"
      ? "Los datos ya son esos: no hay nada para corregir"
      : null,
  );
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (devState) return;
    if (!getApiBaseUrl()) {
      setFetchStatus("error");
      return;
    }
    setFetchStatus("loading");
    try {
      const response = await fetchAdminPending();
      setData(response);
      setFetchStatus("ok");
    } catch {
      setData(EMPTY_PENDING);
      setFetchStatus("error");
    }
  }, [devState]);

  useEffect(() => {
    void load();
  }, [load]);

  const setTab = useCallback(
    (next: PendingTab) => {
      const params = new URLSearchParams(searchParams);
      if (next === "diferencias") params.set("tab", "diferencias");
      else params.delete("tab");
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const openCorregir = useCallback(
    (userId: string, dni: string, nombre: string, apellido: string) => {
      setDialogUserId(userId);
      setDialogDni(dni);
      setDialogNombre(nombre);
      setDialogApellido(apellido);
      setInitialNombre(nombre);
      setInitialApellido(apellido);
      setDialogMotivo("");
      setDialogError(null);
      setDialogOpen(true);
    },
    [],
  );

  const closeCorregir = useCallback(() => {
    if (dialogSubmitting) return;
    setDialogOpen(false);
    setDialogError(null);
  }, [dialogSubmitting]);

  const saveCorregir = useCallback(async () => {
    if (!dialogUserId) return;
    const body = buildCorregirBody(
      dialogNombre,
      dialogApellido,
      dialogMotivo,
      initialNombre,
      initialApellido,
    );
    if (!body) {
      setDialogError(
        dialogMotivo.trim().length < 5
          ? "Contá brevemente el motivo"
          : "Indicá un cambio en nombre o apellido",
      );
      return;
    }

    if (devState) {
      if (devState === "sin-cambios") return;
      setDialogSubmitting(true);
      window.setTimeout(() => {
        setDialogSubmitting(false);
        setDialogOpen(false);
        setSavedBanner(true);
      }, 500);
      return;
    }

    setDialogSubmitting(true);
    setDialogError(null);
    try {
      await corregirIdentidad(dialogUserId, body);
      setDialogOpen(false);
      setSavedBanner(true);
      await load();
    } catch (error) {
      if (error instanceof ApiError) {
        setDialogError(error.message);
      } else if (isNetworkError(error)) {
        setDialogError("No pudimos guardar. Probá de nuevo.");
      } else {
        setDialogError("No pudimos guardar. Probá de nuevo.");
      }
    } finally {
      setDialogSubmitting(false);
    }
  }, [
    devState,
    dialogApellido,
    dialogMotivo,
    dialogNombre,
    dialogUserId,
    initialApellido,
    initialNombre,
    load,
  ]);

  const aplicarPadron = useCallback(
    async (userId: string, dni: string, perfil: string, padron: string) => {
      if (devState) {
        setResolvedNotice({ dni, perfil, padron });
        return;
      }
      setActionUserId(userId);
      setResolvedNotice(null);
      try {
        await aplicarDiferenciaPadron(userId);
        setSavedBanner(true);
        await load();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setResolvedNotice({ dni, perfil, padron });
        }
        await load();
      } finally {
        setActionUserId(null);
      }
    },
    [devState, load],
  );

  const mantenerActual = useCallback(
    async (userId: string, dni: string, perfil: string, padron: string) => {
      if (devState) {
        setResolvedNotice({ dni, perfil, padron });
        return;
      }
      setActionUserId(userId);
      setResolvedNotice(null);
      try {
        await descartarDiferenciaPadron(userId);
        await load();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setResolvedNotice({ dni, perfil, padron });
        }
        await load();
      } finally {
        setActionUserId(null);
      }
    },
    [devState, load],
  );

  const activeTab: PendingTab =
    devState === "diferencias" ? "diferencias" : tab;

  const verificacionCount = data.verificacion.total;
  const diferenciasCount = data.diferenciasPadron.total;
  const currentItems =
    activeTab === "verificacion"
      ? data.verificacion.items
      : data.diferenciasPadron.items;
  const currentTotal =
    activeTab === "verificacion" ? verificacionCount : diferenciasCount;

  const dataState =
    devState === "cargando" || fetchStatus === "loading"
      ? "cargando"
      : devState === "error" || fetchStatus === "error"
        ? "error"
        : devState === "vacio" || (currentTotal === 0 && !devState)
          ? "vacio"
          : "ok";

  return {
    devState,
    dataState,
    activeTab,
    setTab,
    data,
    verificacionCount,
    diferenciasCount,
    currentItems,
    currentTotal,
    savedBanner,
    dismissSavedBanner: () => setSavedBanner(false),
    resolvedNotice,
    dismissResolvedNotice: () => setResolvedNotice(null),
    dialogOpen,
    dialogDni,
    dialogNombre,
    dialogApellido,
    dialogMotivo,
    dialogError,
    dialogSubmitting,
    setDialogNombre,
    setDialogApellido,
    setDialogMotivo,
    openCorregir,
    closeCorregir,
    saveCorregir,
    aplicarPadron,
    mantenerActual,
    actionUserId,
    retry: load,
  };
}
