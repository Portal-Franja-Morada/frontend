import { buttonVariants } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import { useState } from "react";
import { navLinks } from "../data/mock";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-franja-border bg-white px-5 py-5.5 lg:px-20 lg:py-[22px]">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6">
        <a href="#" className="shrink-0">
          <img
            src="/logo.png"
            alt="Franja Morada · Económicas"
            className="h-8 w-auto"
            width={220}
            height={32}
          />
        </a>

        <nav
          className="hidden items-center gap-7.5 lg:flex"
          aria-label="Navegación principal"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-bold transition-colors ${
                "active" in link && link.active
                  ? "text-franja-morada"
                  : "text-franja-dark hover:text-franja-morada"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#"
          className={cn(
            buttonVariants({ variant: "default" }),
            "hidden h-11 rounded-lg bg-franja-morada px-5 text-sm font-bold text-white hover:bg-franja-morada/90 lg:inline-flex",
          )}
        >
          Ingresar
        </a>

        <button
          type="button"
          className="text-sm font-bold text-franja-morada lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Cerrar" : "☰"}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="mx-auto mt-4 flex w-full max-w-[1280px] flex-col gap-4 border-t border-franja-border pt-4 lg:hidden"
          aria-label="Navegación móvil"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-bold ${
                "active" in link && link.active
                  ? "text-franja-morada"
                  : "text-franja-dark"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-11 w-fit rounded-lg bg-franja-morada px-5 text-sm font-bold text-white hover:bg-franja-morada/90",
            )}
          >
            Ingresar
          </a>
        </nav>
      ) : null}
    </header>
  );
}
