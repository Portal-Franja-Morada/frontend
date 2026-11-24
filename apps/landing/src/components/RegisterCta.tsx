import { buttonVariants } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import { GoldCorner } from "./GoldCorner";

export function RegisterCta() {
  return (
    <section className="bg-franja-morada px-5 py-6 lg:px-20 lg:py-16">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <GoldCorner />
        <h2 className="text-section leading-section font-bold whitespace-pre-line text-white">
          TU CURSADA,{"\n"}UN POCO MÁS SIMPLE.
        </h2>
        <p className="max-w-3xl text-base text-white">
          Creá tu cuenta y accedé al banco de apuntes, tu calendario, las
          permutas y mucho más. Gratis, para estudiantes como vos.
        </p>
        <a
          href="#"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-12 w-fit rounded-lg bg-franja-gold px-5.5 text-sm font-bold text-franja-morada hover:bg-franja-gold/90",
          )}
        >
          Sumate
        </a>
      </div>
    </section>
  );
}
