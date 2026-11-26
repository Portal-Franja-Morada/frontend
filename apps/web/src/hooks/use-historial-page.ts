import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isNetworkError } from "../lib/api";
import {
  deleteImportedHistory,
  fetchAcademicHistory,
  patchAcademicRecord,
} from "../lib/academic-history-api";
import {
  readHistorialDevState,
  type HistorialDevState,
} from "../lib/historial-dev-state";
import type {
  AcademicHistoryResponse,
  AcademicRecordItem,
} from "../types/academic-history";
import type { MeResponse, StudentCareer } from "../types/auth";

export type HistorialPhase =
  "loading" | "error" | "sin-plan" | "vacio" | "lista";

function demoHistory(): AcademicHistoryResponse {
  const registros: AcademicRecordItem[] = [
    {
      codigo: "EJ-101",
      nombre: "Materia 1A",
      estado: "aprobada",
      nota: 8,
      aplazos: [],
      fecha: "2026-12-15",
      acta: "1234",
      origen: "siu",
    },
    {
      codigo: "EJ-102",
      nombre: "Materia 1B",
      estado: "aprobada",
      nota: 7,
      aplazos: [2, 3],
      fecha: "2027-02-20",
      acta: "1301",
      origen: "siu",
    },
    {
      codigo: "EJ-103",
      nombre: "Materia 1C",
      estado: "aprobada",
      nota: 9,
      aplazos: [],
      fecha: "2027-07-10",
      acta: "1422",
      origen: "manual",
    },
    {
      codigo: "EJ-104",
      nombre: "Materia 1D",
      estado: "regular",
      nota: null,
      aplazos: [],
      fecha: "2027-07-05",
      acta: null,
      origen: "siu",
    },
    {
      codigo: "EJ-201",
      nombre: "Materia 2A",
      estado: "aprobada",
      nota: 6,
      aplazos: [4],
      fecha: "2027-02-18",
      acta: "1310",
      origen: "siu",
    },
    {
      codigo: "EJ-202",
      nombre: "Materia 2B",
      estado: "libre",
      nota: null,
      aplazos: [2],
      fecha: "2027-07-26",
      acta: "1450",
      origen: "siu",
    },
    {
      codigo: "EJ-203",
      nombre: "Materia 2C",
      estado: "cursando",
      nota: null,
      aplazos: [],
      fecha: null,
      acta: null,
      origen: "siu",
    },
  ];
  return {
    carrera: "contador",
    anioPlan: 2026,
    registros,
    ultimoImport: {
      importedAt: "2027-03-12T15:00:00.000Z",
      advertencias: ["Materia 3C no se pudo reconocer."],
      resumen: { importadas: 18, regulares: 4, cursando: 3, noReconocidas: 1 },
    },
    ultimoImportHistorial: {
      importedAt: "2027-03-20T12:00:00.000Z",
      advertencias: ["Aviso de ejemplo 1", "Aviso de ejemplo 2"],
      resumen: {
        filas: 30,
        aplazos: 6,
        materiasConAplazos: 4,
        fechasCompletadas: 22,
        noReconocidas: 2,
      },
    },
  };
}

function careersFromUser(user: MeResponse | null): StudentCareer[] {
  return user?.perfil?.carreras ?? [];
}

function devPhase(
  state: HistorialDevState,
): HistorialPhase | "sin-plan" | null {
  switch (state) {
    case "cargando":
      return "loading";
    case "error":
      return "error";
    case "vacio":
      return "vacio";
    case "sin-plan":
    case "sin-plan-sin-verificar":
      return "sin-plan";
    default:
      return "lista";
  }
}

function derivePhase(
  careers: StudentCareer[],
  slug: string | null,
): HistorialPhase {
  if (careers.length === 0) return "vacio";
  const row = careers.find((c) => c.slug === (slug ?? careers[0]!.slug));
  if (!row?.anioPlan) return "sin-plan";
  return "lista";
}

export function useHistorialPage(user: MeResponse | null) {
  const devState = useMemo(
    () => (import.meta.env.DEV ? readHistorialDevState() : null),
    [],
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSlug = searchParams.get("carrera");

  const careers = useMemo(() => {
    if (
      devState &&
      devState !== "vacio" &&
      devState !== "sin-plan" &&
      devState !== "sin-plan-sin-verificar"
    ) {
      return [{ slug: "contador", nombre: "Contador Público", anioPlan: 2026 }];
    }
    return careersFromUser(user);
  }, [devState, user]);

  const activeCareer = useMemo(() => {
    const slug = selectedSlug ?? careers[0]?.slug ?? null;
    if (!slug) return null;
    return careers.find((c) => c.slug === slug) ?? null;
  }, [careers, selectedSlug]);

  const phase = useMemo((): HistorialPhase => {
    if (devState) {
      const forced = devPhase(devState);
      if (forced) return forced;
    }
    return derivePhase(careers, selectedSlug);
  }, [devState, careers, selectedSlug]);

  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    () => {
      if (devState === "cargando") return "loading";
      if (devState === "error") return "error";
      if (devState && devPhase(devState) === "lista") return "ready";
      if (devState && devPhase(devState)) return "ready";
      return "loading";
    },
  );

  const [data, setData] = useState<AcademicHistoryResponse | null>(() => {
    if (devState === "vacio") {
      return {
        carrera: "contador",
        anioPlan: 2026,
        registros: [],
        ultimoImport: null,
        ultimoImportHistorial: null,
      };
    }
    if (devState && devPhase(devState) === "lista") return demoHistory();
    return null;
  });

  const [savedBanner, setSavedBanner] = useState(devState === "guardado-ok");
  const [editing, setEditing] = useState<AcademicRecordItem | null>(() =>
    devState === "editar" ? demoHistory().registros[1]! : null,
  );
  const [deleteOpen, setDeleteOpen] = useState(
    devState === "confirmar-borrado",
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      if (devPhase(devState) !== "lista") {
        setLoadState("ready");
        return;
      }
      setLoadState("ready");
      return;
    }

    if (phase !== "lista" || !activeCareer?.slug) {
      setLoadState("ready");
      setData(null);
      return;
    }

    setLoadState("loading");
    try {
      const response = await fetchAcademicHistory(activeCareer.slug);
      setData(response);
      setLoadState("ready");
    } catch (error) {
      if (isNetworkError(error)) {
        setLoadState("error");
        return;
      }
      setLoadState("error");
    }
  }, [devState, phase, activeCareer]);

  useEffect(() => {
    void load();
  }, [load]);

  const isEmpty = useMemo(() => {
    if (phase === "vacio") return true;
    if (!data) return false;
    return data.registros.length === 0 && !data.ultimoImport;
  }, [phase, data]);

  const saveRecord = useCallback(
    async (codigo: string, body: Parameters<typeof patchAcademicRecord>[2]) => {
      if (devState) {
        setEditing(null);
        setSavedBanner(true);
        return;
      }
      if (!activeCareer?.slug) return;
      setSaving(true);
      try {
        await patchAcademicRecord(activeCareer.slug, codigo, body);
        setEditing(null);
        setSavedBanner(true);
        await load();
      } finally {
        setSaving(false);
      }
    },
    [devState, activeCareer, load],
  );

  const confirmDelete = useCallback(async () => {
    if (devState) {
      setDeleteOpen(false);
      return;
    }
    if (!activeCareer?.slug) return;
    setDeleting(true);
    try {
      await deleteImportedHistory(activeCareer.slug);
      setDeleteOpen(false);
      await load();
    } finally {
      setDeleting(false);
    }
  }, [devState, activeCareer, load]);

  const selectCareer = useCallback(
    (slug: string) => setSearchParams({ carrera: slug }),
    [setSearchParams],
  );

  const showUnverified = devState === "sin-plan-sin-verificar";

  return {
    devState,
    phase,
    careers,
    activeCareer,
    loadState,
    data,
    isEmpty,
    savedBanner,
    dismissSavedBanner: () => setSavedBanner(false),
    editing,
    setEditing,
    deleteOpen,
    setDeleteOpen,
    saving,
    deleting,
    saveRecord,
    confirmDelete,
    selectCareer,
    retry: load,
    showUnverified,
  };
}
