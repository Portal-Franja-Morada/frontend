import { useCallback, useEffect, useMemo, useState } from "react";
import { isNetworkError } from "../lib/api";
import { fetchCurrentUser } from "../lib/auth-api";
import {
  readPerfilDevState,
  type PerfilDevState,
} from "../lib/perfil-dev-state";
import type { MeResponse } from "../types/auth";

export type PerfilLoadState = "loading" | "ready" | "error";

const DEMO_VERIFIED: MeResponse = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "martina.sosa@ejemplo.com",
  rol: "VERIFIED_STUDENT",
  emailVerificado: true,
  verificacion: { estado: "verificado", motivo: null, motivoRechazo: null },
  perfil: {
    nombre: "Martina",
    apellido: "Sosa",
    nombreVisible: null,
    nombreParaMostrar: "Martina Sosa",
    estadoVerificacion: "verificado",
    carreras: [
      { slug: "contador", nombre: "Contador Público", anioPlan: 2026 },
      {
        slug: "administracion",
        nombre: "Licenciatura en Administración",
        anioPlan: null,
      },
    ],
  },
};

function demoUser(state: PerfilDevState): MeResponse {
  switch (state) {
    case "email-sin-confirmar":
      return {
        ...DEMO_VERIFIED,
        emailVerificado: false,
        perfil: null,
        verificacion: {
          estado: "sin_enviar",
          motivo: null,
          motivoRechazo: null,
        },
      };
    case "verificacion-sin-completar":
      return {
        ...DEMO_VERIFIED,
        emailVerificado: true,
        perfil: null,
        verificacion: {
          estado: "sin_enviar",
          motivo: null,
          motivoRechazo: null,
        },
      };
    case "verificacion-pendiente":
      return {
        ...DEMO_VERIFIED,
        verificacion: {
          estado: "pendiente",
          motivo: "dni_no_en_padron",
          motivoRechazo: null,
        },
        perfil: {
          ...DEMO_VERIFIED.perfil!,
          estadoVerificacion: "pendiente",
          carreras: [],
        },
      };
    case "sin-datos-academicos":
      return {
        ...DEMO_VERIFIED,
        perfil: { ...DEMO_VERIFIED.perfil!, carreras: [] },
      };
    default:
      return DEMO_VERIFIED;
  }
}

export function usePerfilPage() {
  const devState = useMemo(
    () => (import.meta.env.DEV ? readPerfilDevState() : null),
    [],
  );

  const [loadState, setLoadState] = useState<PerfilLoadState>(
    devState === "error"
      ? "error"
      : devState === "cargando"
        ? "loading"
        : "loading",
  );
  const [user, setUser] = useState<MeResponse | null>(() =>
    devState && devState !== "cargando" && devState !== "error"
      ? demoUser(devState)
      : null,
  );
  const [savedBanner, setSavedBanner] = useState(
    devState === "datos-guardados",
  );

  const load = useCallback(async () => {
    if (devState) {
      if (devState === "cargando") {
        setLoadState("loading");
        return;
      }
      if (devState === "error") {
        setLoadState("error");
        return;
      }
      setUser(demoUser(devState));
      setLoadState("ready");
      return;
    }

    setLoadState("loading");
    try {
      const me = await fetchCurrentUser();
      if (!me) {
        setLoadState("error");
        return;
      }
      setUser(me);
      setLoadState("ready");
    } catch (error) {
      if (isNetworkError(error)) {
        setLoadState("error");
        return;
      }
      setLoadState("error");
    }
  }, [devState]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    loadState,
    user,
    savedBanner,
    dismissSavedBanner: () => setSavedBanner(false),
    retry: load,
    devState,
  };
}
