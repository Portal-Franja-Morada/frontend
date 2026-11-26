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
  rechazarUsuario,
  verificarUsuario,
} from "../lib/usuarios-api";
import { buildCorregirBody } from "../components/CorregirNombreDialog";
import { isRechazoMotivoValid } from "../components/RechazarVerificacionDialog";
import type { PendingResponse } from "../types/usuarios";

export type PendingTab = "verificacion" | "diferencias";

type FetchStatus = "idle" | "loading" | "error" | "ok";

export type SuccessBanner = "corregir" | "verificar" | "rechazar" | null;

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

  const [successBanner, setSuccessBanner] = useState<SuccessBanner>(
    devState === "guardado-ok" ? "corregir" : null,
  );
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

  const [rechazarOpen, setRechazarOpen] = useState(
    devState === "modal-rechazar",
  );
  const [rechazarUserId, setRechazarUserId] = useState<string | null>(
    devState === "modal-rechazar"
      ? DEMO_PENDING.verificacion.items[0]!.userId
      : null,
  );
  const [rechazarDni, setRechazarDni] = useState(
    devState === "modal-rechazar" ? "40111001" : "",
  );
  const [rechazarNombre, setRechazarNombre] = useState(
    devState === "modal-rechazar" ? "Lucía" : "",
  );
  const [rechazarApellido, setRechazarApellido] = useState(
    devState === "modal-rechazar" ? "Gómez" : "",
  );
  const [rechazarMotivo, setRechazarMotivo] = useState("");
  const [rechazarError, setRechazarError] = useState<string | null>(null);
  const [rechazarSubmitting, setRechazarSubmitting] = useState(false);

  const [verificarOpen, setVerificarOpen] = useState(
    devState === "modal-verificar",
  );
  const [verificarUserId, setVerificarUserId] = useState<string | null>(
    devState === "modal-verificar"
      ? DEMO_PENDING.verificacion.items[0]!.userId
      : null,
  );
  const [verificarDni, setVerificarDni] = useState(
    devState === "modal-verificar" ? "40111001" : "",
  );
  const [verificarNombre, setVerificarNombre] = useState(
    devState === "modal-verificar" ? "Lucía" : "",
  );
  const [verificarApellido, setVerificarApellido] = useState(
    devState === "modal-verificar" ? "Gómez" : "",
  );
  const [verificarError, setVerificarError] = useState<string | null>(null);
  const [verificarSubmitting, setVerificarSubmitting] = useState(false);

  const [verificacionResolvedNotice, setVerificacionResolvedNotice] = useState<{
    dni: string;
    nombre: string;
  } | null>(null);

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
        setSuccessBanner("corregir");
      }, 500);
      return;
    }

    setDialogSubmitting(true);
    setDialogError(null);
    try {
      await corregirIdentidad(dialogUserId, body);
      setDialogOpen(false);
      setSuccessBanner("corregir");
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
        setSuccessBanner("corregir");
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

  const openRechazar = useCallback(
    (userId: string, dni: string, nombre: string, apellido: string) => {
      setRechazarUserId(userId);
      setRechazarDni(dni);
      setRechazarNombre(nombre);
      setRechazarApellido(apellido);
      setRechazarMotivo("");
      setRechazarError(null);
      setRechazarOpen(true);
    },
    [],
  );

  const closeRechazar = useCallback(() => {
    if (rechazarSubmitting) return;
    setRechazarOpen(false);
    setRechazarError(null);
  }, [rechazarSubmitting]);

  const confirmRechazar = useCallback(async () => {
    if (!rechazarUserId) return;
    if (!isRechazoMotivoValid(rechazarMotivo)) {
      setRechazarError("Contá brevemente el motivo");
      return;
    }

    if (devState) {
      setRechazarSubmitting(true);
      window.setTimeout(() => {
        setRechazarSubmitting(false);
        setRechazarOpen(false);
        setSuccessBanner("rechazar");
      }, 500);
      return;
    }

    setRechazarSubmitting(true);
    setRechazarError(null);
    setActionUserId(rechazarUserId);
    const motivo = rechazarMotivo.trim();
    try {
      await rechazarUsuario(rechazarUserId, motivo);
      setRechazarOpen(false);
      setSuccessBanner("rechazar");
      await load();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setRechazarOpen(false);
        setVerificacionResolvedNotice({
          dni: rechazarDni,
          nombre: `${rechazarNombre} ${rechazarApellido}`.trim(),
        });
        await load();
      } else if (error instanceof ApiError) {
        setRechazarError(error.message);
      } else if (isNetworkError(error)) {
        setRechazarError("No pudimos rechazar. Probá de nuevo.");
      } else {
        setRechazarError("No pudimos rechazar. Probá de nuevo.");
      }
    } finally {
      setRechazarSubmitting(false);
      setActionUserId(null);
    }
  }, [
    devState,
    load,
    rechazarApellido,
    rechazarDni,
    rechazarMotivo,
    rechazarNombre,
    rechazarUserId,
  ]);

  const openVerificar = useCallback(
    (userId: string, dni: string, nombre: string, apellido: string) => {
      setVerificarUserId(userId);
      setVerificarDni(dni);
      setVerificarNombre(nombre);
      setVerificarApellido(apellido);
      setVerificarError(null);
      setVerificarOpen(true);
    },
    [],
  );

  const closeVerificar = useCallback(() => {
    if (verificarSubmitting) return;
    setVerificarOpen(false);
    setVerificarError(null);
  }, [verificarSubmitting]);

  const confirmVerificar = useCallback(async () => {
    if (!verificarUserId) return;

    if (devState) {
      setVerificarSubmitting(true);
      window.setTimeout(() => {
        setVerificarSubmitting(false);
        setVerificarOpen(false);
        setSuccessBanner("verificar");
      }, 500);
      return;
    }

    setVerificarSubmitting(true);
    setVerificarError(null);
    setActionUserId(verificarUserId);
    try {
      await verificarUsuario(verificarUserId);
      setVerificarOpen(false);
      setSuccessBanner("verificar");
      await load();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setVerificarOpen(false);
        setVerificacionResolvedNotice({
          dni: verificarDni,
          nombre: `${verificarNombre} ${verificarApellido}`.trim(),
        });
        await load();
      } else if (error instanceof ApiError) {
        setVerificarError(error.message);
      } else if (isNetworkError(error)) {
        setVerificarError("No pudimos verificar. Probá de nuevo.");
      } else {
        setVerificarError("No pudimos verificar. Probá de nuevo.");
      }
    } finally {
      setVerificarSubmitting(false);
      setActionUserId(null);
    }
  }, [
    devState,
    load,
    verificarApellido,
    verificarDni,
    verificarNombre,
    verificarUserId,
  ]);

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
    successBanner,
    dismissSuccessBanner: () => setSuccessBanner(null),
    resolvedNotice,
    dismissResolvedNotice: () => setResolvedNotice(null),
    verificacionResolvedNotice,
    dismissVerificacionResolvedNotice: () =>
      setVerificacionResolvedNotice(null),
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
    openRechazar,
    closeRechazar,
    confirmRechazar,
    rechazarOpen,
    rechazarDni,
    rechazarNombre,
    rechazarApellido,
    rechazarMotivo,
    rechazarError,
    rechazarSubmitting,
    setRechazarMotivo,
    openVerificar,
    closeVerificar,
    confirmVerificar,
    verificarOpen,
    verificarDni,
    verificarNombre,
    verificarApellido,
    verificarError,
    verificarSubmitting,
    retry: load,
  };
}
