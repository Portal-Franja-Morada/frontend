import { buttonVariants } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-franja-morada px-5 py-10 lg:px-20 lg:py-[72px]">
      <img
        src="/hero-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-franja-morada/75"
      />
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <p className="text-xs font-bold tracking-wide text-white">
          TU CENTRO DE ESTUDIANTES
        </p>

        <div className="max-w-[790px] rounded-[20px] border border-franja-gold p-7">
          <h1 className="text-hero leading-hero font-bold whitespace-pre-line text-white">
            LA FACU SE VIVE{"\n"}EN COMUNIDAD.
          </h1>
        </div>

        <p className="max-w-3xl text-base font-normal text-white lg:text-xl lg:font-bold">
          Información, herramientas y una comunidad para acompañarte en cada
          paso.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="/registro"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-12 rounded-lg bg-franja-morada px-5.5 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-franja-morada/90",
            )}
          >
            Crear cuenta
          </a>
          <a
            href="/novedades"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-12 rounded-lg border-franja-gold bg-transparent px-5.5 text-sm font-bold text-white hover:bg-white/10",
            )}
          >
            Ver novedades
          </a>
        </div>

        <p className="text-xs font-bold tracking-wide text-white">
          CIENCIAS ECONÓMICAS · UNNE · RESISTENCIA
        </p>
      </div>
    </section>
  );
}
