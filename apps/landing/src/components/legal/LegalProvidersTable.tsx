import type { LegalTableRow } from "../../types/legal";

type LegalProvidersTableProps = {
  rows: LegalTableRow[];
};

export function LegalProvidersTable({ rows }: LegalProvidersTableProps) {
  return (
    <>
      <div className="hidden lg:block">
        <div className="overflow-hidden rounded-lg border border-franja-border bg-white">
          <div className="grid grid-cols-[150px_230px_1fr] border-b border-franja-border bg-white text-[11px] font-bold tracking-wide text-franja-muted uppercase">
            <div className="px-4 py-3.5">Proveedor</div>
            <div className="px-4 py-3.5">Función</div>
            <div className="px-4 py-3.5">Datos que puede tratar</div>
          </div>
          {rows.map((row) => (
            <div
              key={row.provider}
              className="grid grid-cols-[150px_230px_1fr] border-b border-franja-border bg-white text-base text-franja-dark last:border-b-0"
            >
              <div className="px-4 py-3.5 font-bold text-franja-morada">
                {row.provider}
              </div>
              <div className="px-4 py-3.5">{row.role}</div>
              <div className="px-4 py-3.5">{row.data}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        {rows.map((row) => (
          <article
            key={row.provider}
            className="flex flex-col gap-4 rounded-lg border border-franja-border bg-white p-4"
          >
            <p className="text-base font-bold text-franja-morada">
              {row.provider}
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-bold tracking-wide text-franja-muted uppercase">
                Función
              </p>
              <p className="text-base text-franja-dark">{row.role}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-bold tracking-wide text-franja-muted uppercase">
                Datos que puede tratar
              </p>
              <p className="text-base text-franja-dark">{row.data}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
