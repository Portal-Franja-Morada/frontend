import { useCallback, useEffect, useMemo, useState } from "react";
import { isNetworkError } from "../lib/api";
import {
  type CareerAssignment,
  updateStudentCareers,
} from "../lib/careers-api";
import { readMisCarrerasDevState } from "../lib/mis-carreras-dev-state";
import type { MeResponse, StudentCareer } from "../types/auth";

export const MAX_STUDENT_CAREERS = 4;

const DEMO_CAREERS: StudentCareer[] = [
  { slug: "contador", nombre: "Contador Público", anioPlan: 2026 },
  {
    slug: "administracion",
    nombre: "Licenciatura en Administración",
    anioPlan: 2018,
  },
];

const DEMO_FOUR: StudentCareer[] = [
  { slug: "contador", nombre: "Carrera de ejemplo 1", anioPlan: 2026 },
  { slug: "administracion", nombre: "Carrera de ejemplo 2", anioPlan: 2018 },
  { slug: "economia", nombre: "Carrera de ejemplo 3", anioPlan: 2026 },
  { slug: "comercio-exterior", nombre: "Carrera de ejemplo 4", anioPlan: 2018 },
];

function careersFromUser(user: MeResponse | null): StudentCareer[] {
  return user?.perfil?.carreras ?? [];
}

function toAssignments(carreras: StudentCareer[]): CareerAssignment[] {
  return carreras.map((c) => ({
    carrera: c.slug,
    ...(c.anioPlan !== null ? { anioPlan: c.anioPlan } : {}),
  }));
}

export function useMisCarrerasPage(user: MeResponse | null) {
  const devState = useMemo(
    () => (import.meta.env.DEV ? readMisCarrerasDevState() : null),
    [],
  );

  const sourceCareers = useMemo(() => {
    if (devState === "limite-4") return DEMO_FOUR;
    if (devState) return DEMO_CAREERS;
    return careersFromUser(user);
  }, [devState, user]);

  const [draft, setDraft] = useState<StudentCareer[]>(sourceCareers);
  const loadState = useMemo<"loading" | "ready" | "error">(() => {
    if (devState === "cargando") return "loading";
    if (devState === "error") return "error";
    return "ready";
  }, [devState]);
  const [savedBanner, setSavedBanner] = useState(devState === "guardado-ok");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(sourceCareers);
  }, [sourceCareers]);

  const dirty = useMemo(() => {
    if (draft.length !== sourceCareers.length) return true;
    return draft.some((c, i) => {
      const orig = sourceCareers[i];
      return !orig || orig.slug !== c.slug || orig.anioPlan !== c.anioPlan;
    });
  }, [draft, sourceCareers]);

  const atLimit = draft.length >= MAX_STUDENT_CAREERS;

  const removeCareer = useCallback((slug: string) => {
    setDraft((prev) => prev.filter((c) => c.slug !== slug));
    setSaveError(null);
  }, []);

  const save = useCallback(
    async (refresh: () => Promise<void>) => {
      if (devState) {
        if (draft.length === 0) {
          setSaveError("Tenés que conservar al menos una carrera.");
          return;
        }
        setSavedBanner(true);
        return;
      }
      if (draft.length === 0) {
        setSaveError("Tenés que conservar al menos una carrera.");
        return;
      }
      if (!dirty) return;

      setSaving(true);
      setSaveError(null);
      try {
        await updateStudentCareers(toAssignments(draft));
        setSavedBanner(true);
        await refresh();
      } catch (error) {
        if (isNetworkError(error)) {
          setSaveError("No pudimos guardar. Probá de nuevo.");
        } else if (error instanceof Error) {
          setSaveError(error.message);
        } else {
          setSaveError("No pudimos guardar. Probá de nuevo.");
        }
      } finally {
        setSaving(false);
      }
    },
    [devState, draft, dirty],
  );

  return {
    devState,
    loadState,
    draft,
    atLimit,
    dirty,
    savedBanner,
    dismissSavedBanner: () => setSavedBanner(false),
    saving,
    saveError,
    removeCareer,
    save,
    showUnverifiedAdd: devState === "agregar-sin-verificar",
  };
}
