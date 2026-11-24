export function CalendarConfirmBanner() {
  return (
    <div
      className="rounded-lg bg-[#edf6f0] p-5"
      role="status"
      aria-live="polite"
    >
      <p className="text-xs font-bold text-[#246448]">¡LISTO PARA AGENDAR!</p>
      <p className="mt-2 text-[13px] font-normal text-[#246448]">
        Se preparó el evento para tu calendario. Confirmá la incorporación en tu
        aplicación.
      </p>
    </div>
  );
}
