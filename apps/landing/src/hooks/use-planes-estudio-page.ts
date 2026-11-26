import { useCallback, useEffect, useMemo, useState } from "react";
import type { CareerItem, PlanDetalle } from "../types/curriculum";
import { fetchPublicCareers, getApiBaseUrl } from "../lib/fetch-careers";
import { fetchPublicPlan, PlanNotFoundError } from "../lib/fetch-plan";
import { planLabel, selectionFromUrl } from "../lib/plan-display";
import { readPlanesDevState } from "../lib/planes-dev-state";

export type PlanesPageState = "cargando" | "listo" | "vacio" | "error";

const MISSING_API_URL_MESSAGE =
  "[@franja/landing] Falta PUBLIC_API_URL. Definila en apps/landing/.env para cargar datos del backend.";

function careerName(careers: CareerItem[], slug: string | null): string | null {
  if (!slug) return null;
  return careers.find((c) => c.slug === slug)?.nombre ?? null;
}

function syncUrl(carrera: string, anio: number) {
  const url = new URL(window.location.href);
  url.searchParams.set("carrera", carrera);
  url.searchParams.set("plan", String(anio));
  url.searchParams.delete("estado");
  window.history.replaceState(null, "", url);
}

export function usePlanesEstudioPage() {
  const devState = useMemo(() => readPlanesDevState(), []);

  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [plan, setPlan] = useState<PlanDetalle | null>(null);
  const [selectedCarrera, setSelectedCarrera] = useState<string | null>(null);
  const [selectedAnio, setSelectedAnio] = useState<number | null>(null);
  const [careersStatus, setCareersStatus] = useState<
    "idle" | "loading" | "error" | "ok"
  >(devState ? "ok" : getApiBaseUrl() ? "loading" : "error");
  const [planStatus, setPlanStatus] = useState<PlanesPageState>(
    devState ?? "cargando",
  );

  const loadCareers = useCallback(async () => {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      console.warn(MISSING_API_URL_MESSAGE);
      setCareersStatus("error");
      setPlanStatus("error");
      return;
    }

    setCareersStatus("loading");
    try {
      const data = await fetchPublicCareers(baseUrl);
      setCareers(data.items);
      setCareersStatus("ok");

      if (data.items.length === 0) {
        setPlanStatus("vacio");
        return;
      }

      const picked = selectionFromUrl(
        data.items,
        new URLSearchParams(window.location.search),
      );
      if (!picked) {
        setPlanStatus("vacio");
        return;
      }

      setSelectedCarrera(picked.carrera);
      setSelectedAnio(picked.anio);
    } catch {
      setCareers([]);
      setCareersStatus("error");
      setPlanStatus("error");
    }
  }, []);

  const loadPlan = useCallback(async (carrera: string, anio: number) => {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      setPlanStatus("error");
      return;
    }

    setPlanStatus("cargando");
    setPlan(null);
    try {
      const data = await fetchPublicPlan(baseUrl, carrera, anio);
      setPlan(data);
      setPlanStatus("listo");
      syncUrl(carrera, anio);
    } catch (error) {
      if (error instanceof PlanNotFoundError) {
        setPlan(null);
        setPlanStatus("vacio");
        return;
      }
      setPlan(null);
      setPlanStatus("error");
    }
  }, []);

  useEffect(() => {
    if (devState) return;
    void loadCareers();
  }, [devState, loadCareers]);

  useEffect(() => {
    if (devState || !selectedCarrera || selectedAnio === null) return;
    void loadPlan(selectedCarrera, selectedAnio);
  }, [devState, selectedCarrera, selectedAnio, loadPlan]);

  const selectCareer = useCallback(
    (slug: string) => {
      const career = careers.find((c) => c.slug === slug);
      if (!career) return;
      const nextPlan = career.planes.find((p) => p.vigente) ?? career.planes[0];
      if (!nextPlan) {
        setSelectedCarrera(slug);
        setSelectedAnio(null);
        setPlan(null);
        setPlanStatus("vacio");
        return;
      }
      setSelectedCarrera(slug);
      setSelectedAnio(nextPlan.anio);
    },
    [careers],
  );

  const selectPlan = useCallback(
    (anio: number) => {
      if (!selectedCarrera) return;
      setSelectedAnio(anio);
    },
    [selectedCarrera],
  );

  const retry = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("estado");
    window.location.href = url.toString();
  }, []);

  const activeCareer = careers.find((c) => c.slug === selectedCarrera) ?? null;
  const activePlanSummary =
    activeCareer?.planes.find((p) => p.anio === selectedAnio) ?? null;

  const pageState: PlanesPageState = devState ?? planStatus;

  return {
    devState,
    pageState,
    careers,
    careersStatus,
    plan,
    selectedCarrera,
    selectedAnio,
    activeCareer,
    activePlanSummary,
    careerTitle: careerName(careers, selectedCarrera),
    planTitle:
      selectedAnio !== null && activePlanSummary
        ? planLabel(selectedAnio, activePlanSummary.vigente)
        : null,
    selectCareer,
    selectPlan,
    retry,
  };
}
