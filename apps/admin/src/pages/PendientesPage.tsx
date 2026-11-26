import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { AdminLayout } from "../components/AdminLayout";
import { CorregirNombreDialog } from "../components/CorregirNombreDialog";
import { PublishConfirmOverlay } from "../components/PostEditorOverlays";
import { RechazarVerificacionDialog } from "../components/RechazarVerificacionDialog";
import {
  type PendingTab,
  type SuccessBanner,
  useAdminPendingPage,
} from "../hooks/use-admin-pending-page";
import { formatAdminListDate } from "../lib/dates";
import { formatDni } from "../lib/dni";
import type {
  PendingDiferenciaItem,
  PendingVerificacionItem,
} from "../types/usuarios";

const thClass =
  "px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-franja-muted";

const actionClass =
  "text-sm font-bold text-franja-morada disabled:cursor-not-allowed disabled:opacity-40";

function nombreCompleto(nombre: string, apellido: string): string {
  return `${nombre} ${apellido}`.trim();
}

export function PendientesPage() {
  const vm = useAdminPendingPage();

  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-8 px-5 py-8 lg:px-10 lg:py-10">
        <nav aria-label="Recorrido" className="text-[13px] text-franja-muted">
          Administración / Pendientes
        </nav>

        <div>
          <h1 className="text-[26px] font-bold text-franja-dark lg:text-[36px]">
            PENDIENTES
          </h1>
          <p className="mt-2 text-base text-franja-muted">
            Alumnos que no se pudieron verificar solos y diferencias de nombre
            con el padrón.
          </p>
        </div>

        <PendingTabs
          activeTab={vm.activeTab}
          verificacionCount={vm.verificacionCount}
          diferenciasCount={vm.diferenciasCount}
          onSelect={vm.setTab}
        />

        {vm.resolvedNotice ? (
          <ResolvedNotice
            notice={vm.resolvedNotice}
            onDismiss={vm.dismissResolvedNotice}
          />
        ) : null}

        {vm.verificacionResolvedNotice ? (
          <VerificacionResolvedNotice
            notice={vm.verificacionResolvedNotice}
            onDismiss={vm.dismissVerificacionResolvedNotice}
          />
        ) : null}

        {vm.dataState === "cargando" ? <LoadingState /> : null}
        {vm.dataState === "error" ? <ErrorState onRetry={vm.retry} /> : null}
        {vm.dataState === "vacio" ? (
          <EmptyState
            title="No hay pendientes 🎉"
            message="Cuando haya alumnos para revisar, van a aparecer acá."
          />
        ) : null}

        {vm.dataState === "ok" ? (
          <>
            <TabInfo tab={vm.activeTab} total={vm.currentTotal} />

            <div className="overflow-x-auto rounded-xl border border-franja-border bg-white">
              <table className="min-w-full text-sm">
                {vm.activeTab === "verificacion" ? (
                  <VerificacionTable
                    items={vm.data.verificacion.items}
                    busyUserId={vm.actionUserId}
                    onCorregir={vm.openCorregir}
                    onAprobar={vm.openVerificar}
                    onRechazar={vm.openRechazar}
                  />
                ) : (
                  <DiferenciasTable
                    items={vm.data.diferenciasPadron.items}
                    busyUserId={vm.actionUserId}
                    onCorregir={vm.openCorregir}
                    onAplicar={vm.aplicarPadron}
                    onMantener={vm.mantenerActual}
                  />
                )}
              </table>
            </div>

            <p className="text-[13px] text-franja-muted">
              Mostrando {vm.currentItems.length} de {vm.currentTotal}. Cada
              lista muestra hasta 100 personas.
            </p>
          </>
        ) : null}
      </main>

      <CorregirNombreDialog
        open={vm.dialogOpen}
        dni={vm.dialogDni}
        nombre={vm.dialogNombre}
        apellido={vm.dialogApellido}
        motivo={vm.dialogMotivo}
        error={vm.dialogError}
        submitting={vm.dialogSubmitting}
        onNombreChange={vm.setDialogNombre}
        onApellidoChange={vm.setDialogApellido}
        onMotivoChange={vm.setDialogMotivo}
        onConfirm={() => void vm.saveCorregir()}
        onCancel={vm.closeCorregir}
      />

      <RechazarVerificacionDialog
        open={vm.rechazarOpen}
        dni={vm.rechazarDni}
        nombre={vm.rechazarNombre}
        apellido={vm.rechazarApellido}
        motivo={vm.rechazarMotivo}
        error={vm.rechazarError}
        submitting={vm.rechazarSubmitting}
        onMotivoChange={vm.setRechazarMotivo}
        onConfirm={() => void vm.confirmRechazar()}
        onCancel={vm.closeRechazar}
      />

      {vm.verificarOpen ? (
        <PublishConfirmOverlay
          busy={vm.verificarSubmitting}
          title="¿APROBÁS LA VERIFICACIÓN?"
          message={`${vm.verificarNombre} ${vm.verificarApellido} · DNI ${formatDni(vm.verificarDni)} va a quedar verificado como estudiante.`}
          confirmLabel="Sí, aprobar"
          cancelLabel="Cancelar"
          error={vm.verificarError}
          onConfirm={() => void vm.confirmVerificar()}
          onCancel={vm.closeVerificar}
        />
      ) : null}

      {vm.successBanner ? (
        <SuccessBannerToast
          kind={vm.successBanner}
          onDismiss={vm.dismissSuccessBanner}
        />
      ) : null}
    </AdminLayout>
  );
}

function PendingTabs({
  activeTab,
  verificacionCount,
  diferenciasCount,
  onSelect,
}: {
  activeTab: PendingTab;
  verificacionCount: number;
  diferenciasCount: number;
  onSelect: (tab: PendingTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => onSelect("verificacion")}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-bold",
          activeTab === "verificacion"
            ? "bg-franja-morada text-white"
            : "border border-franja-border bg-white text-franja-dark",
        )}
      >
        Verificación · {verificacionCount}
      </button>
      <button
        type="button"
        onClick={() => onSelect("diferencias")}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-bold",
          activeTab === "diferencias"
            ? "bg-franja-morada text-white"
            : "border border-franja-border bg-white text-franja-dark",
        )}
      >
        Diferencias con el padrón · {diferenciasCount}
      </button>
    </div>
  );
}

function TabInfo({ tab, total }: { tab: PendingTab; total: number }) {
  if (tab === "verificacion") {
    return (
      <div className="rounded-xl border border-franja-border bg-white p-4">
        <p className="text-3xl font-bold text-franja-dark">{total}</p>
        <p className="text-sm text-franja-muted">alumnos sin verificar</p>
        <p className="mt-3 flex items-start gap-2 text-sm text-franja-muted">
          <span aria-hidden="true" className="font-bold text-franja-morada">
            i
          </span>
          Revisá cada caso y elegí aprobar o rechazar la verificación.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-franja-border bg-white p-4">
      <p className="text-3xl font-bold text-franja-dark">{total}</p>
      <p className="text-sm text-franja-muted">diferencias de nombre</p>
      <p className="mt-3 flex items-start gap-2 text-sm text-franja-muted">
        <span aria-hidden="true" className="font-bold text-franja-morada">
          i
        </span>
        Elegí qué nombre queda. También podés corregirlo a mano.
      </p>
    </div>
  );
}

function SuccessBannerToast({
  kind,
  onDismiss,
}: {
  kind: SuccessBanner;
  onDismiss: () => void;
}) {
  const message =
    kind === "corregir"
      ? "✓ Guardamos el nombre."
      : kind === "verificar"
        ? "✓ Verificación aprobada."
        : "✓ Verificación rechazada.";

  return (
    <div className="fixed bottom-5 left-1/2 z-40 w-[min(100%-2.5rem,28rem)] -translate-x-1/2 rounded-lg border border-franja-border bg-white p-4 shadow-lg">
      <p className="text-xs font-bold uppercase tracking-wide text-[#246448]">
        {message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 text-sm font-bold text-franja-morada"
      >
        Cerrar
      </button>
    </div>
  );
}

function VerificacionResolvedNotice({
  notice,
  onDismiss,
}: {
  notice: { dni: string; nombre: string };
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-xl border border-franja-border bg-white p-4">
      <p className="text-sm font-bold text-franja-error">
        Esa solicitud ya fue resuelta.
      </p>
      <p className="mt-1 text-sm text-franja-muted">
        Otro admin la procesó antes que vos. La quitamos de la lista.
      </p>
      <p className="mt-3 text-sm font-bold text-franja-dark">
        DNI {formatDni(notice.dni)}
      </p>
      <p className="text-sm text-franja-muted">{notice.nombre}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 text-sm font-bold text-franja-morada"
      >
        Cerrar
      </button>
    </div>
  );
}

function ResolvedNotice({
  notice,
  onDismiss,
}: {
  notice: { dni: string; perfil: string; padron: string };
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-xl border border-franja-border bg-white p-4">
      <p className="text-sm font-bold text-franja-error">
        Esa diferencia ya fue resuelta.
      </p>
      <p className="mt-1 text-sm text-franja-muted">
        Otro admin la resolvió antes que vos. La quitamos de la lista.
      </p>
      <p className="mt-3 text-sm font-bold text-franja-dark">
        DNI {formatDni(notice.dni)}
      </p>
      <p className="text-sm text-franja-muted">
        {notice.perfil} → {notice.padron}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 text-sm font-bold text-franja-morada"
      >
        Cerrar
      </button>
    </div>
  );
}

function VerificacionTable({
  items,
  busyUserId,
  onCorregir,
  onAprobar,
  onRechazar,
}: {
  items: PendingVerificacionItem[];
  busyUserId: string | null;
  onCorregir: (
    userId: string,
    dni: string,
    nombre: string,
    apellido: string,
  ) => void;
  onAprobar: (
    userId: string,
    dni: string,
    nombre: string,
    apellido: string,
  ) => void;
  onRechazar: (
    userId: string,
    dni: string,
    nombre: string,
    apellido: string,
  ) => void;
}) {
  return (
    <>
      <thead className="border-b border-franja-border bg-franja-surface">
        <tr>
          <th className={thClass}>Email</th>
          <th className={thClass}>Confirmó email</th>
          <th className={thClass}>Nombre</th>
          <th className={thClass}>Apellido</th>
          <th className={thClass}>DNI</th>
          <th className={thClass}>Carrera</th>
          <th className={thClass}>Registro</th>
          <th className={thClass}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const busy = busyUserId === item.userId;

          return (
            <tr
              key={item.userId}
              className="border-b border-franja-border last:border-0"
            >
              <td className="px-3 py-4 text-franja-dark">{item.email}</td>
              <td className="px-3 py-4 text-franja-dark">
                {item.emailVerificado ? "SÍ" : "NO"}
              </td>
              <td className="px-3 py-4 text-franja-dark">{item.nombre}</td>
              <td className="px-3 py-4 text-franja-dark">{item.apellido}</td>
              <td className="px-3 py-4 text-franja-dark">
                {formatDni(item.dni)}
              </td>
              <td className="px-3 py-4 text-franja-dark">
                {item.carrera ?? "—"}
              </td>
              <td className="px-3 py-4 text-franja-muted">
                {formatAdminListDate(item.registradoAt)}
              </td>
              <td className="px-3 py-4">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onCorregir(
                        item.userId,
                        item.dni,
                        item.nombre,
                        item.apellido,
                      )
                    }
                    className={actionClass}
                  >
                    Corregir nombre
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onAprobar(
                        item.userId,
                        item.dni,
                        item.nombre,
                        item.apellido,
                      )
                    }
                    className={actionClass}
                  >
                    {busy ? "Procesando…" : "Aprobar"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onRechazar(
                        item.userId,
                        item.dni,
                        item.nombre,
                        item.apellido,
                      )
                    }
                    className={actionClass}
                  >
                    Rechazar
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </>
  );
}

function DiferenciasTable({
  items,
  busyUserId,
  onCorregir,
  onAplicar,
  onMantener,
}: {
  items: PendingDiferenciaItem[];
  busyUserId: string | null;
  onCorregir: (
    userId: string,
    dni: string,
    nombre: string,
    apellido: string,
  ) => void;
  onAplicar: (
    userId: string,
    dni: string,
    perfil: string,
    padron: string,
  ) => Promise<void>;
  onMantener: (
    userId: string,
    dni: string,
    perfil: string,
    padron: string,
  ) => Promise<void>;
}) {
  return (
    <>
      <thead className="border-b border-franja-border bg-franja-surface">
        <tr>
          <th className={thClass}>DNI</th>
          <th className={thClass}>Nombre en el perfil</th>
          <th className={thClass}>Nombre en el padrón</th>
          <th className={thClass}>Detectada</th>
          <th className={thClass}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const perfil = nombreCompleto(
            item.perfil.nombre,
            item.perfil.apellido,
          );
          const padron = nombreCompleto(
            item.padron.nombre,
            item.padron.apellido,
          );
          const busy = busyUserId === item.userId;

          return (
            <tr
              key={item.userId}
              className="border-b border-franja-border last:border-0"
            >
              <td className="px-3 py-4 text-franja-dark">
                {formatDni(item.dni)}
              </td>
              <td className="px-3 py-4 text-franja-dark">{perfil}</td>
              <td className="px-3 py-4 text-franja-dark">{padron}</td>
              <td className="px-3 py-4 text-franja-muted">
                {formatAdminListDate(item.detectadaAt)}
              </td>
              <td className="px-3 py-4">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void onAplicar(item.userId, item.dni, perfil, padron)
                    }
                    className={actionClass}
                  >
                    Usar el del padrón
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void onMantener(item.userId, item.dni, perfil, padron)
                    }
                    className={actionClass}
                  >
                    Mantener el actual
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onCorregir(
                        item.userId,
                        item.dni,
                        item.perfil.nombre,
                        item.perfil.apellido,
                      )
                    }
                    className={actionClass}
                  >
                    Corregir nombre
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </>
  );
}
