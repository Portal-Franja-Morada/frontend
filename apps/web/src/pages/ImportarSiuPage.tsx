import { Link } from "react-router-dom";
import { StudentLayout } from "../components/StudentLayout";
import { useAuth } from "../hooks/use-auth";
import {
  useImportSiuPage,
  type ImportUiState,
  type VerificationGate,
} from "../hooks/use-import-siu-page";
import { getLandingSiteUrl } from "../lib/constants";
import type { MeResponse } from "../types/auth";

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    const text = mb.toFixed(1).replace(".", ",");
    return `${text} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

export function ImportarSiuPage() {
  const { user, refresh } = useAuth();
  const vm = useImportSiuPage(user);

  const handleUpload = async () => {
    if (!vm.selectedFile) {
      vm.pickFile();
      return;
    }
    await vm.upload(vm.selectedFile);
    if (!import.meta.env.DEV || !vm.devState) await refresh({ silent: true });
  };

  return (
    <StudentLayout>
      <section className="bg-franja-morada px-5 py-14 text-white lg:px-10 lg:py-16">
        <div className="w-full">
          <p className="text-[13px] text-white/90">
            Inicio / Importar PDF del SIU
          </p>
          <h1 className="mt-3 whitespace-pre-line text-[26px] font-bold leading-tight lg:text-[36px]">
            IMPORTÁ TU{"\n"}PDF DEL SIU.
          </h1>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-white/90">
            Solo para alumnos verificados
          </p>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-10 lg:py-14">
        <div className="w-full space-y-8">
          <IntroCard />

          <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
            <SiuFileInput vm={vm} />
            {vm.verificationGate &&
            vm.verificationGate !== "verificado-prompt" ? (
              <VerificationGateCard gate={vm.verificationGate} user={user} />
            ) : vm.verificationGate === "verificado-prompt" &&
              vm.uiState === "form" ? (
              <div className="space-y-6">
                <VerifiedPrompt onImport={vm.pickFile} />
                <ImportForm
                  selectedFile={vm.selectedFile}
                  uiState={vm.uiState}
                  onPickFile={vm.pickFile}
                  onUpload={() => void handleUpload()}
                />
              </div>
            ) : (
              <ImportPanel vm={vm} onUpload={() => void handleUpload()} />
            )}
          </div>

          <SiuGuideCard />
        </div>
      </section>
    </StudentLayout>
  );
}

function IntroCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        Cargá tus materias desde el SIU
      </p>
      <p className="mt-2 text-base text-franja-muted">
        Subí el PDF que bajás del SIU Guaraní y cargamos tus materias y notas.
      </p>
      <div className="mt-6 space-y-4">
        <StepCard
          label="PRIMERO · OBLIGATORIO"
          title="1. Plan de estudios"
          description="Carga materias, estados y notas."
        />
        <StepCard
          label="DESPUÉS · OPCIONAL"
          title="2. Historial académico"
          description="Suma aplazos y fechas."
        />
      </div>
    </div>
  );
}

function StepCard({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-franja-border p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-franja-morada">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-franja-dark">{title}</p>
      <p className="mt-1 text-sm text-franja-muted">{description}</p>
    </div>
  );
}

type ImportPanelProps = {
  vm: ReturnType<typeof useImportSiuPage>;
  onUpload: () => void;
};

function ImportPanel({ vm, onUpload }: ImportPanelProps) {
  if (vm.uiState === "processing") {
    return (
      <ProcessingCard
        fileName={vm.selectedFile?.name ?? "plan-de-estudios.pdf"}
        fileSize={vm.selectedFile?.size ?? 1_200_000}
      />
    );
  }

  if (vm.uiState.startsWith("success-")) {
    return (
      <SuccessCard
        variant={vm.uiState === "success-plan" ? "plan" : "historial"}
        careerLine={vm.successCareerLine ?? ""}
        summary={vm.successSummary ?? ""}
        warnings={vm.uploadResult?.advertencias ?? []}
        warningsOpen={vm.warningsOpen}
        onToggleWarnings={() => vm.setWarningsOpen((v) => !v)}
      />
    );
  }

  if (vm.uiState.startsWith("error-")) {
    return (
      <ErrorCard
        state={vm.uiState}
        detail={vm.errorDetail}
        onChooseFile={() => {
          vm.resetToForm();
          vm.pickFile();
        }}
        onReset={vm.resetToForm}
        onRetry={vm.retry}
      />
    );
  }

  return (
    <ImportForm
      selectedFile={vm.selectedFile}
      uiState={vm.uiState}
      onPickFile={vm.pickFile}
      onUpload={onUpload}
    />
  );
}

function SiuFileInput({
  vm,
}: {
  vm: ReturnType<typeof useImportSiuPage>;
}) {
  return (
    <input
      ref={vm.fileInputRef}
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      onChange={(event) => {
        const file = event.target.files?.[0] ?? null;
        vm.onFileChange(file);
      }}
    />
  );
}

function ImportForm({
  selectedFile,
  uiState,
  onPickFile,
  onUpload,
}: {
  selectedFile: File | null;
  uiState: ImportUiState;
  onPickFile: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-base font-bold text-franja-dark lg:hidden">
          Elegí tu PDF desde tu celular
        </p>
        <p className="hidden text-base font-bold text-franja-dark lg:block">
          Elegí tu PDF
        </p>
        <p className="mt-1 text-sm text-franja-muted">
          Solo PDF, hasta 2 MB
          {selectedFile ? ` · ${selectedFile.name}` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onPickFile}
          className="flex h-12 flex-1 items-center justify-center rounded-lg border border-franja-border bg-white text-sm font-bold text-franja-morada"
        >
          Elegir archivo
        </button>
        <button
          type="button"
          onClick={onUpload}
          disabled={uiState === "processing"}
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-franja-morada text-sm font-bold text-white disabled:opacity-60"
        >
          Subir
        </button>
      </div>

      <p className="text-[13px] text-franja-muted">
        Tu PDF no se guarda: solo lo leemos para cargar tus datos.
      </p>
    </div>
  );
}

function ProcessingCard({
  fileName,
  fileSize,
}: {
  fileName: string;
  fileSize: number;
}) {
  return (
    <div className="space-y-4 text-center lg:text-left">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        Procesando tu PDF…
      </p>
      <p className="text-base text-franja-muted">
        Puede tardar unos segundos. No cierres esta pantalla.
      </p>
      <p className="text-sm font-bold text-franja-dark">{fileName}</p>
      <p className="text-sm text-franja-muted">{formatFileSize(fileSize)}</p>
    </div>
  );
}

function SuccessCard({
  variant,
  careerLine,
  summary,
  warnings,
  warningsOpen,
  onToggleWarnings,
}: {
  variant: "plan" | "historial";
  careerLine: string;
  summary: string;
  warnings: string[];
  warningsOpen: boolean;
  onToggleWarnings: () => void;
}) {
  const title =
    variant === "plan"
      ? "¡Listo! Cargamos tu plan"
      : "¡Listo! Sumamos tu historial";

  return (
    <div className="space-y-6">
      <p className="text-2xl font-bold text-franja-dark">{title}</p>
      {variant === "plan" ? (
        <p className="text-base text-franja-muted">{careerLine}</p>
      ) : null}
      <p className="text-base text-franja-muted">{summary}</p>

      {warnings.length > 0 ? (
        <div className="rounded-lg border border-franja-border p-4">
          <button
            type="button"
            onClick={onToggleWarnings}
            className="flex w-full items-center justify-between gap-3 text-left text-sm font-bold text-franja-morada"
          >
            <span>Revisá esto ({warnings.length})</span>
            <span>{warningsOpen ? "Ocultar ▴" : "Ver ▾"}</span>
          </button>
          {warningsOpen ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-franja-muted">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <Link
        to="/historial"
        className="inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white"
      >
        Ver mi historial
      </Link>
    </div>
  );
}

function ErrorCard({
  state,
  detail,
  onChooseFile,
  onReset,
  onRetry,
}: {
  state: ImportUiState;
  detail: string | null;
  onChooseFile: () => void;
  onReset: () => void;
  onRetry: () => void;
}) {
  const copy = errorCopy(state);
  const showDetail = detail && state === "error-plan-mismatch";

  const action = (() => {
    if (state === "error-timeout") {
      return (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white"
        >
          Reintentar
        </button>
      );
    }
    if (state === "error-historial-without-plan") {
      return (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white"
        >
          Subir primero mi plan
        </button>
      );
    }
    if (state === "error-rate-limit") {
      return null;
    }
    return (
      <button
        type="button"
        onClick={onChooseFile}
        className="inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white"
      >
        Elegir otro archivo
      </button>
    );
  })();

  return (
    <div className="space-y-4">
      <p className="text-2xl font-bold text-franja-dark">{copy.title}</p>
      <p className="text-base text-franja-muted">{copy.message}</p>
      {showDetail ? (
        <p className="text-sm text-franja-muted">{detail}</p>
      ) : null}
      {action}
    </div>
  );
}

function errorCopy(state: ImportUiState): { title: string; message: string } {
  switch (state) {
    case "error-size":
      return {
        title: "El archivo pesa más de 2 MB",
        message: "Probá con un PDF más liviano.",
      };
    case "error-not-pdf":
      return {
        title: "Tiene que ser un PDF",
        message: "Elegí el archivo en formato PDF que bajaste del SIU.",
      };
    case "error-no-siu":
      return {
        title: "Este PDF no parece del SIU Guaraní",
        message: "Usá el PDF tal como lo bajaste del SIU.",
      };
    case "error-plan-unsupported":
      return {
        title: "Todavía no soportamos este plan, pronto lo agregamos",
        message:
          "El PDF puede ser de una carrera cuyos planes aún no cargamos.",
      };
    case "error-historial-without-plan":
      return {
        title: "Este historial no tiene registros de una carrera cargada",
        message:
          "Primero subí el PDF del plan de esa carrera; después sumás el historial.",
      };
    case "error-rate-limit":
      return {
        title: "Llegaste al máximo de 10 subidas por hora",
        message: "Probá de nuevo más tarde.",
      };
    case "error-timeout":
      return {
        title: "El PDF tardó mucho en procesarse, probá de nuevo",
        message: "Reintentá la subida en unos segundos.",
      };
    case "error-plan-mismatch":
      return {
        title: "El plan no coincide",
        message:
          "Este PDF es de un año de plan distinto al que ya tenés cargado para esta carrera.",
      };
    default:
      return {
        title: "Algo no salió bien",
        message: "Probá de nuevo en unos segundos.",
      };
  }
}

function VerificationGateCard({
  gate,
  user,
}: {
  gate: Exclude<VerificationGate, null | "verificado-prompt">;
  user: MeResponse | null;
}) {
  const landing = getLandingSiteUrl();

  if (gate === "sin-enviar") {
    return (
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-wide text-franja-error">
          Sin enviar
        </p>
        <h2 className="text-xl font-bold text-franja-dark">
          Verificá tu cuenta para importar
        </h2>
        <p className="text-base text-franja-muted">
          Para importar PDFs del SIU tu cuenta tiene que estar verificada.
        </p>
        <a
          href={`${landing}/verificacion`}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white"
        >
          Verificar mi cuenta
        </a>
      </div>
    );
  }

  if (gate === "pendiente") {
    return (
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
          En revisión
        </p>
        <h2 className="text-xl font-bold text-franja-dark">
          Verificá tu cuenta para importar
        </h2>
        <p className="text-base text-franja-muted">
          El centro de estudiantes está revisando tu verificación. Todavía no
          podés importar.
        </p>
      </div>
    );
  }

  const motivo = rejectionReason(user);

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-error">
        Rechazada
      </p>
      <h2 className="text-xl font-bold text-franja-dark">
        Verificá tu cuenta para importar
      </h2>
      <p className="text-base text-franja-muted">Motivo: {motivo}.</p>
      <a
        href={`${landing}/verificacion`}
        className="inline-flex h-12 items-center justify-center rounded-lg bg-franja-morada px-6 text-sm font-bold text-white"
      >
        Reenviar verificación
      </a>
    </div>
  );
}

function VerifiedPrompt({ onImport }: { onImport: () => void }) {
  return (
    <div className="space-y-3 border-b border-franja-border pb-6">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        Cuenta verificada
      </p>
      <p className="text-xl font-bold text-franja-dark">Ya podés importar</p>
      <p className="text-base text-franja-muted">
        Subí el PDF de tu plan o de tu historial del SIU.
      </p>
      <button
        type="button"
        onClick={onImport}
        className="inline-flex h-12 items-center justify-center rounded-lg border border-franja-border bg-white px-6 text-sm font-bold text-franja-morada"
      >
        Importar PDF del SIU
      </button>
    </div>
  );
}

function rejectionReason(user: MeResponse | null): string {
  if (user?.verificacion.motivoRechazo) return user.verificacion.motivoRechazo;
  if (user?.verificacion.motivo === "dni_no_en_padron") {
    return "el DNI no figura en el padrón de alumnos";
  }
  if (user?.verificacion.motivo === "nombre_no_coincide") {
    return "el nombre no coincide con el padrón";
  }
  return "revisá tus datos y volvé a enviar";
}

function SiuGuideCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-franja-morada">
        Cómo bajar tus PDFs del SIU Guaraní
      </p>
      <ol className="mt-6 space-y-4">
        {[1, 2, 3].map((step) => (
          <li key={step} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-franja-morada text-sm font-bold text-white">
              {step}
            </span>
            <p className="pt-1 text-base text-franja-muted">
              Paso pendiente de definir
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-[13px] text-franja-muted">
        Los pasos dentro del SIU se completan cuando estén confirmados.
      </p>
    </div>
  );
}
