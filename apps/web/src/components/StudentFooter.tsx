export function StudentFooter() {
  return (
    <footer className="bg-franja-morada px-5 py-8 text-white lg:px-20">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-9">
          <div className="shrink-0">
            <img
              src="/logo-footer.png"
              alt="Franja Morada · Económicas"
              className="h-7 w-auto"
              width={210}
              height={27}
            />
          </div>
          <div className="flex flex-col gap-2 lg:flex-1">
            <p className="text-sm font-bold">CERCA TUYO, EN CADA PASO.</p>
            <p className="text-[13px] leading-relaxed text-white">
              Centro de estudiantes · Ciencias Económicas, UNNE
              <br />
              Resistencia, Chaco, Argentina.
            </p>
          </div>
          <div className="flex flex-col gap-2 lg:flex-1">
            <span className="text-sm font-bold">Instagram ↗</span>
            <span className="text-[13px]">
              Contactá al centro de estudiantes
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-[13px] text-white lg:flex-row lg:gap-6">
          <span>Términos y Condiciones</span>
          <span>Política de Privacidad</span>
        </div>
        <p className="text-[13px] text-white">
          Transparencia, cercanía, trabajo y reformismo.
        </p>
      </div>
    </footer>
  );
}
