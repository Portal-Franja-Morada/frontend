import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, isNetworkError } from "../lib/api";
import {
  deleteApunteLink,
  exportApuntesPlan,
  fetchApuntesPlan,
  upsertApunteLink,
  validateApuntesLink,
} from "../lib/apuntes-api";
import { fetchPublicCareers } from "../lib/careers-api";
import type {
  ApunteMateria,
  ApuntesPlanResponse,
  CareerItem,
} from "../types/apuntes";

type DataState = "idle" | "cargando" | "ok" | "error" | "vacio";

export type EditMateriaTarget = {
  codigo: string;
  nombre: string;
  link: string;
  tieneApuntes: boolean;
};

export function useAdminApuntesPage() {
  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [careersState, setCareersState] = useState<DataState>("idle");
  const [selectedCarrera, setSelectedCarrera] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [data, setData] = useState<ApuntesPlanResponse | null>(null);
  const [dataState, setDataState] = useState<DataState>("idle");
  const [dataError, setDataError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<EditMateriaTarget | null>(null);
  const [editLink, setEditLink] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  const openEdit = useCallback((materia: ApunteMateria) => {
    setEditTarget({
      codigo: materia.codigo,
      nombre: materia.nombre,
      link: materia.link ?? "",
      tieneApuntes: materia.tieneApuntes,
    });
    setEditLink(materia.link ?? "");
    setEditError(null);
  }, []);

  const closeEdit = useCallback(() => {
    if (editSubmitting) return;
    setEditTarget(null);
    setEditLink("");
    setEditError(null);
  }, [editSubmitting]);

  const saveLink = useCallback(async () => {
    if (!editTarget || !selectedCarrera || selectedPlan === null) return;
    const validation = validateApuntesLink(editLink);
    if (validation) {
      setEditError(validation);
      return;
    }

    setEditSubmitting(true);
    setEditError(null);
    try {
      await upsertApunteLink(
        selectedCarrera,
        selectedPlan,
        editTarget.codigo,
        editLink.trim(),
      );
      setEditTarget(null);
      await loadPlan(selectedCarrera, selectedPlan);
    } catch (error) {
      if (error instanceof ApiError) {
        setEditError(error.message);
      } else if (isNetworkError(error)) {
        setEditError("No pudimos guardar el link. Probá de nuevo.");
      } else {
        setEditError("No pudimos guardar el link. Probá de nuevo.");
      }
    } finally {
      setEditSubmitting(false);
    }
  }, [editLink, editTarget, loadPlan, selectedCarrera, selectedPlan]);

  const removeLink = useCallback(async () => {
    if (!editTarget || !selectedCarrera || selectedPlan === null) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      await deleteApunteLink(selectedCarrera, selectedPlan, editTarget.codigo);
      setEditTarget(null);
      await loadPlan(selectedCarrera, selectedPlan);
    } catch (error) {
      if (error instanceof ApiError) {
        setEditError(error.message);
      } else {
        setEditError("No pudimos quitar el link. Probá de nuevo.");
      }
    } finally {
      setEditSubmitting(false);
    }
  }, [editTarget, loadPlan, selectedCarrera, selectedPlan]);

  const exportPlan = useCallback(async () => {
    if (!selectedCarrera || selectedPlan === null) return;
    setExporting(true);
    setExportError(null);
    try {
      const { filename, blob } = await exportApuntesPlan(
        selectedCarrera,
        selectedPlan,
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof ApiError) {
        setExportError(error.message);
      } else {
        setExportError("No pudimos exportar el plan. Probá de nuevo.");
      }
    } finally {
      setExporting(false);
    }
  }, [selectedCarrera, selectedPlan]);

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
    exporting,
    exportError,
    exportPlan,
    editTarget,
    editLink,
    editError,
    editSubmitting,
    openEdit,
    closeEdit,
    setEditLink,
    saveLink,
    removeLink,
  };
}
