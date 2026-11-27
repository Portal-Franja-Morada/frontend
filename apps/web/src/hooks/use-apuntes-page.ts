import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, isNetworkError } from "../lib/api";
import { fetchApuntesPlan } from "../lib/apuntes-api";
import { fetchPublicCareers } from "../lib/careers-public-api";
import type { ApuntesPlanResponse, CareerItem } from "../types/apuntes";

type DataState = "idle" | "cargando" | "ok" | "error" | "vacio";

export function useApuntesPage() {
  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [careersState, setCareersState] = useState<DataState>("idle");
  const [selectedCarrera, setSelectedCarrera] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [data, setData] = useState<ApuntesPlanResponse | null>(null);
  const [dataState, setDataState] = useState<DataState>("idle");
  const [dataError, setDataError] = useState<string | null>(null);
  const [soloConApuntes, setSoloConApuntes] = useState(false);

  const loadCareers = useCallback(async () => {
    setCareersState("cargando");
    try {
      const response = await fetchPublicCareers();
      const withPlanes = response.items.filter((c) => c.planes.length > 0);
      setCareers(withPlanes);
      setCareersState(withPlanes.length > 0 ? "ok" : "vacio");
      if (withPlanes.length > 0) {
        const first = withPlanes[0]!;
        setSelectedCarrera((prev) => prev ?? first.slug);
        setSelectedPlan((prev) => prev ?? first.planes[0]!.anio);
      }
    } catch {
      setCareersState("error");
    }
  }, []);

  const loadPlan = useCallback(async (carrera: string, plan: number) => {
    setDataState("cargando");
    setDataError(null);
    setData(null);
    try {
      const response = await fetchApuntesPlan(carrera, plan);
      setData(response);
      setDataState(response.anios.length > 0 ? "ok" : "vacio");
    } catch (error) {
      if (error instanceof ApiError) {
        setDataError(error.message);
      } else if (isNetworkError(error)) {
        setDataError("No pudimos cargar el banco de apuntes. Probá de nuevo.");
      } else {
        setDataError("No pudimos cargar el banco de apuntes. Probá de nuevo.");
      }
      setDataState("error");
    }
  }, []);

  useEffect(() => {
    void loadCareers();
  }, [loadCareers]);

  useEffect(() => {
    if (!selectedCarrera || selectedPlan === null) return;
    void loadPlan(selectedCarrera, selectedPlan);
  }, [loadPlan, selectedCarrera, selectedPlan]);

  const career = useMemo(
    () => careers.find((c) => c.slug === selectedCarrera) ?? null,
    [careers, selectedCarrera],
  );

  const selectCareer = useCallback(
    (slug: string) => {
      setSelectedCarrera(slug);
      const item = careers.find((c) => c.slug === slug);
      setSelectedPlan(item?.planes[0]?.anio ?? null);
    },
    [careers],
  );

  const selectPlan = useCallback((anio: number) => {
    setSelectedPlan(anio);
  }, []);

  const retry = useCallback(() => {
    if (careersState === "error") {
      void loadCareers();
      return;
    }
    if (selectedCarrera && selectedPlan !== null) {
      void loadPlan(selectedCarrera, selectedPlan);
    }
  }, [careersState, loadCareers, loadPlan, selectedCarrera, selectedPlan]);

  const filteredAnios = useMemo(() => {
    if (!data) return [];
    if (!soloConApuntes) return data.anios;
    return data.anios
      .map((grupo) => ({
        ...grupo,
        materias: grupo.materias.filter((m) => m.tieneApuntes),
      }))
      .filter((grupo) => grupo.materias.length > 0);
  }, [data, soloConApuntes]);

  return {
    careers,
    careersState,
    career,
    selectedCarrera,
    selectedPlan,
    selectCareer,
    selectPlan,
    data,
    dataState,
    dataError,
    retry,
    soloConApuntes,
    setSoloConApuntes,
    filteredAnios,
  };
}
