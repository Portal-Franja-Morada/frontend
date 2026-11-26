import { useEffect, useState } from "react";
import {
  clearAccountDeletedQuery,
  readAccountDeletedBanner,
} from "../lib/account-deleted-banner";

export function AccountDeletedBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readAccountDeletedBanner()) {
      setVisible(true);
      clearAccountDeletedQuery();
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="border-b border-franja-border bg-white px-5 py-4 lg:px-20">
      <div className="mx-auto flex w-full max-w-[1280px] items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#246448]">
            ✓ Tu cuenta fue dada de baja
          </p>
          <p className="mt-1 text-sm text-franja-muted">
            Se cerró la sesión y volviste a la página de inicio.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-sm font-bold text-franja-morada"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
