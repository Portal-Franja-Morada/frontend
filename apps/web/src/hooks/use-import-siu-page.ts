import { useCallback, useMemo, useRef, useState } from "react";
import { ApiError, isNetworkError } from "../lib/api";
import { uploadAcademicHistoryPdf } from "../lib/academic-history-api";
import { careerLabel } from "../lib/careers";
import {
  readImportSiuDevState,
  type ImportSiuDevState,
} from "../lib/import-siu-dev-state";
import type { AcademicHistoryUploadResponse } from "../types/academic-history";
import type { MeResponse } from "../types/auth";

export const MAX_PDF_BYTES = 2 * 1024 * 1024;

export type ImportUiState =
  | "form"
  | "processing"
  | "success-plan"
  | "success-historial"
  | "error-size"
  | "error-not-pdf"
  | "error-no-siu"
  | "error-plan-unsupported"
  | "error-historial-without-plan"
  | "error-rate-limit"
  | "error-timeout"
  | "error-plan-mismatch";

export type VerificationGate =
  "sin-enviar" | "pendiente" | "rechazado" | "verificado-prompt" | null;

const DEMO_PLAN_SUCCESS: AcademicHistoryUploadResponse = {
  tipoDocumento: "plan",
  carrera: "contador",
  anioPlan: 2026,
  importadas: 18,
  regulares: 4,
  cursando: 3,
  noReconocidas: 1,
  advertencias: ["ECON-170: materia con advertencia de ejemplo"],
};

const DEMO_HISTORIAL_SUCCESS: AcademicHistoryUploadResponse = {
  tipoDocumento: "historial",
  carrera: "contador",
  anioPlan: 2026,
  aplazos: 6,
  materiasConAplazos: 4,
  fechasCompletadas: 22,
  noReconocidas: 2,
  advertencias: [
    "ECO-101: nota del plan difiere del historial",
    "ECO-220: materia con advertencia de ejemplo",
  ],
};

function devUiState(state: ImportSiuDevState): ImportUiState | null {
  const map: Partial<Record<ImportSiuDevState, ImportUiState>> = {
    subiendo: "processing",
    "exito-plan": "success-plan",
    "exito-historial": "success-historial",
    "error-tamano": "error-size",
    "error-no-pdf": "error-not-pdf",
    "error-no-siu": "error-no-siu",
    "error-plan-no-soportado": "error-plan-unsupported",
    "error-historial-sin-plan": "error-historial-without-plan",
    "error-rate-limit": "error-rate-limit",
    "error-timeout": "error-timeout",
    "error-plan-no-coincide": "error-plan-mismatch",
  };
  return map[state] ?? null;
}

function devVerificationGate(state: ImportSiuDevState): VerificationGate {
  switch (state) {
    case "verificacion-sin-enviar":
      return "sin-enviar";
    case "verificacion-pendiente":
      return "pendiente";
    case "verificacion-rechazada":
      return "rechazado";
    case "verificacion-verificada":
      return "verificado-prompt";
    default:
      return null;
  }
}

function verificationGateForUser(user: MeResponse): VerificationGate {
  if (user.rol !== "VERIFIED_STUDENT") {
    if (user.perfil?.estadoVerificacion === "rechazado") return "rechazado";
    if (
      user.perfil?.estadoVerificacion === "pendiente" ||
      user.verificacion.estado === "pendiente"
    ) {
      return "pendiente";
    }
    return "sin-enviar";
  }
  if (user.perfil?.estadoVerificacion !== "verificado") {
    if (user.perfil?.estadoVerificacion === "rechazado") return "rechazado";
    if (user.perfil?.estadoVerificacion === "pendiente") return "pendiente";
    return "sin-enviar";
  }
  if (!user.emailVerificado) return "sin-enviar";
  return null;
}

function mapApiError(error: ApiError): ImportUiState {
  switch (error.code) {
    case "PAYLOAD_TOO_LARGE":
      return "error-size";
    case "UNSUPPORTED_MEDIA_TYPE":
      return "error-not-pdf";
    case "NO_ES_SIU":
      return "error-no-siu";
    case "PLAN_SIU_NO_SOPORTADO":
      return "error-plan-unsupported";
    case "HISTORIAL_SIN_REGISTROS":
    case "SIN_PLAN_CARGADO":
      return "error-historial-without-plan";
    case "RATE_LIMITED":
      return "error-rate-limit";
    case "SIU_TIMEOUT":
      return "error-timeout";
    case "PLAN_NO_COINCIDE":
      return "error-plan-mismatch";
    default:
      return "error-timeout";
  }
}

export function planConflictDetail(
  message: string,
  user: MeResponse | null,
): string {
  const match = message.match(/plan (\d{4}).*plan (\d{4})/i);
  if (match && user?.perfil?.carreras.length) {
    const loaded = user.perfil.carreras.find((c) => c.anioPlan !== null);
    const careerName = loaded?.nombre ?? user.perfil.carreras[0]!.nombre;
    const pdfPlan = match[1];
    const loadedPlan = match[2];
    return `Cargado: ${careerName} · Plan ${loadedPlan} · PDF nuevo: Plan ${pdfPlan}`;
  }
  return message;
}

export function useImportSiuPage(user: MeResponse | null) {
  const devState = useMemo(
    () => (import.meta.env.DEV ? readImportSiuDevState() : null),
    [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialUi = devState ? (devUiState(devState) ?? "form") : "form";
  const [uiState, setUiState] = useState<ImportUiState>(initialUi);
  const [selectedFile, setSelectedFile] = useState<File | null>(() =>
    devState === "subiendo"
      ? new File([new Uint8Array(100)], "plan-de-estudios.pdf", {
          type: "application/pdf",
        })
      : null,
  );
  const [uploadResult, setUploadResult] =
    useState<AcademicHistoryUploadResponse | null>(() => {
      if (devState === "exito-plan") return DEMO_PLAN_SUCCESS;
      if (devState === "exito-historial") return DEMO_HISTORIAL_SUCCESS;
      return null;
    });
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [warningsOpen, setWarningsOpen] = useState(
    devState !== "exito-historial",
  );

  const verificationGate = useMemo((): VerificationGate => {
    if (devState) {
      const fromDev = devVerificationGate(devState);
      if (fromDev) return fromDev;
      if (devUiState(devState)) return null;
    }
    if (!user) return "sin-enviar";
    return verificationGateForUser(user);
  }, [devState, user]);

  const canImport =
    verificationGate === null || verificationGate === "verificado-prompt";

  const pickFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const resetToForm = useCallback(() => {
    setUiState("form");
    setErrorDetail(null);
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const onFileChange = useCallback((file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setErrorDetail(null);
    setUiState("form");
  }, []);

  const validateClient = useCallback((file: File): ImportUiState | null => {
    if (file.size > MAX_PDF_BYTES) return "error-size";
    const type = file.type.toLowerCase();
    if (type && type !== "application/pdf" && type !== "application/x-pdf") {
      return "error-not-pdf";
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) return "error-not-pdf";
    return null;
  }, []);

  const upload = useCallback(
    async (file: File) => {
      if (devState) {
        const mapped = devUiState(devState);
        if (mapped) {
          setUiState(mapped);
          if (mapped === "success-plan") setUploadResult(DEMO_PLAN_SUCCESS);
          if (mapped === "success-historial")
            setUploadResult(DEMO_HISTORIAL_SUCCESS);
          return;
        }
      }

      const clientError = validateClient(file);
      if (clientError) {
        setUiState(clientError);
        return;
      }

      setSelectedFile(file);
      setUiState("processing");
      setErrorDetail(null);

      try {
        const result = await uploadAcademicHistoryPdf(file);
        setUploadResult(result);
        setUiState(
          result.tipoDocumento === "plan"
            ? "success-plan"
            : "success-historial",
        );
        setWarningsOpen(result.tipoDocumento === "plan");
      } catch (error) {
        if (error instanceof ApiError) {
          setUiState(mapApiError(error));
          if (error.code === "PLAN_NO_COINCIDE") {
            setErrorDetail(planConflictDetail(error.message, user));
          } else {
            setErrorDetail(error.message);
          }
          return;
        }
        if (isNetworkError(error)) {
          setUiState("error-timeout");
          return;
        }
        setUiState("error-timeout");
      }
    },
    [devState, user, validateClient],
  );

  const retry = useCallback(() => {
    if (selectedFile) void upload(selectedFile);
    else setUiState("form");
  }, [selectedFile, upload]);

  const successSummary = useMemo(() => {
    if (!uploadResult) return null;
    if (uploadResult.tipoDocumento === "plan") {
      const parts = [
        uploadResult.importadas != null
          ? `${uploadResult.importadas} materias aprobadas`
          : null,
        uploadResult.regulares != null
          ? `${uploadResult.regulares} regulares`
          : null,
        uploadResult.cursando != null
          ? `${uploadResult.cursando} cursando`
          : null,
        uploadResult.noReconocidas != null
          ? `${uploadResult.noReconocidas} no reconocida${uploadResult.noReconocidas === 1 ? "" : "s"}`
          : null,
      ].filter(Boolean);
      return parts.join(" · ");
    }
    const parts = [
      uploadResult.aplazos != null
        ? `${uploadResult.aplazos} aplazos en ${uploadResult.materiasConAplazos ?? 0} materias`
        : null,
      uploadResult.fechasCompletadas != null
        ? `${uploadResult.fechasCompletadas} fechas completadas`
        : null,
      uploadResult.noReconocidas != null
        ? `${uploadResult.noReconocidas} no reconocida${uploadResult.noReconocidas === 1 ? "" : "s"}`
        : null,
    ].filter(Boolean);
    return parts.join(" · ");
  }, [uploadResult]);

  const successCareerLine = useMemo(() => {
    if (!uploadResult) return null;
    return `${careerLabel(uploadResult.carrera)} · Plan ${uploadResult.anioPlan}`;
  }, [uploadResult]);

  return {
    devState,
    fileInputRef,
    uiState,
    selectedFile,
    uploadResult,
    errorDetail,
    warningsOpen,
    setWarningsOpen,
    verificationGate,
    canImport,
    pickFile,
    resetToForm,
    onFileChange,
    upload,
    retry,
    successSummary,
    successCareerLine,
  };
}
