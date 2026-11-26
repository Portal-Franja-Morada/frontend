import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError, isNetworkError } from "../lib/api";
import { careerLabel } from "../lib/careers";
import { fetchCurriculumMap } from "../lib/curriculum-api";
import {
  readMapaCurricularDevState,
  type MapaCurricularDevState,
} from "../lib/mapa-curricular-dev-state";
import type { CurriculumMapResponse, MateriaPlan } from "../types/curriculum";
import type { MeResponse, StudentCareer } from "../types/auth";

export type MapaPagePhase =
  "loading" | "error" | "sin-carrera" | "sin-plan" | "elegir-carrera" | "mapa";

function demoMap(): CurriculumMapResponse {
  const materias: MateriaPlan[] = [];
  for (let anio = 1; anio <= 5; anio++) {
    for (const [idx, cuat] of [
      ["A", 1],
      ["B", 1],
      ["C", 2],
      ["D", 2],
    ] as const) {
      const codigo = `DEMO-${anio}${idx}`;
      materias.push({
        codigo,
        nombre: `Materia ${anio}${idx}`,
        anio,
        cuatrimestre: cuat,
        creditos: 4,
        horas: null,
        opcionDe: null,
        menuDe: null,
      });
    }
  }
  for (const opt of ["A", "B", "C"]) {
    materias.push({
      codigo: `OPT-${opt}`,
      nombre: `OPTATIVA ${opt}`,
      anio: 5,
      cuatrimestre: null,
      creditos: 3,
      horas: null,
      opcionDe: "SLOT-OPT",
      menuDe: null,
    });
  }
  materias.push({
    codigo: "SLOT-OPT",
    nombre: "Optativa",
    anio: 5,
    cuatrimestre: null,
    creditos: 3,
    horas: null,
    opcionDe: null,
    menuDe: null,
  });

  const mapa: CurriculumMapResponse["mapa"] = {};
  const samples: Array<
    [string, CurriculumMapResponse["mapa"][string]["estado"]]
  > = [
    ["DEMO-1A", "aprobada"],
    ["DEMO-1B", "aprobada"],
    ["DEMO-1C", "aprobada"],
    ["DEMO-1D", "regular"],
    ["DEMO-2A", "aprobada"],
    ["DEMO-2B", "libre"],
    ["DEMO-2C", "cursando"],
    ["DEMO-2D", "regular"],
    ["DEMO-3A", "cursando"],
  ];
  for (const m of materias) {
    const hit = samples.find(([c]) => c === m.codigo);
    const estado = hit?.[1] ?? null;
    mapa[m.codigo] = {
      estado,
      puedeCursar: estado === null && m.codigo === "DEMO-3B",
      puedeRendir:
        estado === "regular" ||
        (estado === null && m.codigo === "DEMO-1D") ||
        m.codigo === "DEMO-2D",
      faltanCursar: m.codigo === "DEMO-3B" ? [] : ["DEMO-2B"],
      faltanRendir: m.codigo === "DEMO-3B" ? ["DEMO-3B", "DEMO-2B"] : [],
      faltanReglas:
        m.codigo === "DEMO-3B" ? ["50% de las materias aprobadas."] : [],
      requisitosExtra: [],
    };
  }

  return {
    plan: {
      carrera: "contador",
      anio_plan: 2026,
      vigente: true,
      materias,
      correlativas: [],
      reglas: [],
    },
    mapa,
    promedios: { conAplazos: 6.8, sinAplazos: 7.4 },
    avance: {
      materias: { aprobadas: 12, total: 40, porcentaje: 30 },
      creditos: null,
    },
  };
}

function careersFromUser(user: MeResponse | null): StudentCareer[] {
  return user?.perfil?.carreras ?? [];
}

function devPhase(state: MapaCurricularDevState): MapaPagePhase | null {
  switch (state) {
    case "cargando":
      return "loading";
    case "error":
      return "error";
    case "sin-carrera":
    case "sin-carrera-sin-verificar":
      return "sin-carrera";
    case "sin-plan":
    case "sin-plan-sin-verificar":
      return "sin-plan";
    case "elegir-carrera":
      return "elegir-carrera";
    case "plan-sin-materias":
    case "detalle-materia":
      return "mapa";
    default:
      return null;
  }
}

function derivePhase(
  careers: StudentCareer[],
  selectedSlug: string | null,
): MapaPagePhase {
  if (careers.length === 0) return "sin-carrera";
  if (careers.length > 1 && !selectedSlug) return "elegir-carrera";
  const slug = selectedSlug ?? careers[0]!.slug;
  const row = careers.find((c) => c.slug === slug);
  if (!row?.anioPlan) return "sin-plan";
  return "mapa";
}

export function useMapaCurricularPage(user: MeResponse | null) {
  const devState = useMemo(
    () => (import.meta.env.DEV ? readMapaCurricularDevState() : null),
    [],
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSlug = searchParams.get("carrera");

  const careers = useMemo(() => {
    if (devState === "elegir-carrera") {
      return [
        { slug: "contador", nombre: "Contador Público", anioPlan: 2026 },
        {
          slug: "administracion",
          nombre: "Licenciatura en Administración",
          anioPlan: null,
        },
      ];
    }
    if (
      devState &&
      devState !== "sin-carrera" &&
      devState !== "sin-carrera-sin-verificar"
    ) {
      return [{ slug: "contador", nombre: "Contador Público", anioPlan: 2026 }];
    }
    return careersFromUser(user);
  }, [devState, user]);

  const phase = useMemo((): MapaPagePhase => {
    if (devState) {
      const forced = devPhase(devState);
      if (forced) return forced;
    }
    return derivePhase(careers, selectedSlug);
  }, [devState, careers, selectedSlug]);

  const activeCareer = useMemo(() => {
    if (phase === "elegir-carrera") return null;
    const slug = selectedSlug ?? careers[0]?.slug ?? null;
    if (!slug) return null;
    return careers.find((c) => c.slug === slug) ?? null;
  }, [phase, selectedSlug, careers]);

  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    () => {
      if (devState === "cargando") return "loading";
      if (devState === "error") return "error";
      if (devState && devPhase(devState) === "mapa") return "ready";
      if (devState && devPhase(devState)) return "ready";
      return "loading";
    },
  );
  const [data, setData] = useState<CurriculumMapResponse | null>(() => {
    if (
      devState === "plan-sin-materias" ||
      devState === "detalle-materia" ||
      (devState && devPhase(devState) === "mapa")
    ) {
      const map = demoMap();
      if (devState === "plan-sin-materias") {
        const empty = {
          ...map,
          promedios: { conAplazos: null, sinAplazos: null },
        };
        empty.avance = {
          materias: { aprobadas: 0, total: 40, porcentaje: 0 },
          creditos: null,
        };
        for (const key of Object.keys(empty.mapa)) {
          empty.mapa[key] = {
            ...empty.mapa[key]!,
            estado: null,
            puedeCursar: false,
            puedeRendir: false,
          };
        }
        return empty;
      }
      return map;
    }
    return null;
  });

  const [selectedMateria, setSelectedMateria] = useState<MateriaPlan | null>(
    () =>
      devState === "detalle-materia"
        ? (demoMap().plan.materias.find((m) => m.codigo === "DEMO-3B") ?? null)
        : null,
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
      if (devPhase(devState) === "mapa") return;
      setLoadState("ready");
      return;
    }

    if (phase !== "mapa" || !activeCareer?.anioPlan) {
      setLoadState("ready");
      setData(null);
      return;
    }

    setLoadState("loading");
    try {
      const response = await fetchCurriculumMap(
        activeCareer.slug,
        activeCareer.anioPlan,
      );
      setData(response);
      setLoadState("ready");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "SIN_CARRERA") {
          setLoadState("ready");
          return;
        }
        if (error.code === "SIN_PLAN_CARGADO") {
          setLoadState("ready");
          return;
        }
      }
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

  const selectCareer = useCallback(
    (slug: string) => {
      setSearchParams({ carrera: slug });
    },
    [setSearchParams],
  );

  const careerTitle = activeCareer
    ? `${activeCareer.nombre} · Plan ${activeCareer.anioPlan}`
    : null;

  const showUnverified =
    devState === "sin-carrera-sin-verificar" ||
    devState === "sin-plan-sin-verificar";

  return {
    devState,
    phase,
    careers,
    activeCareer,
    careerTitle,
    loadState,
    data,
    selectedMateria,
    setSelectedMateria,
    selectCareer,
    retry: load,
    showUnverified,
    careerLabel,
  };
}
