import { buttonVariants } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import { useState } from "react";
import { landingNavLinks } from "../lib/site-nav";

export function StudentHeader({
  currentPath = "/perfil",
}: {
  currentPath?: string;
}) {
  const [open, setOpen] = useState(false);
  const links = landingNavLinks();

  return (
    <header className="border-b border-franja-border bg-white px-5 py-5.5 lg:px-20 lg:py-[22px]">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6">
        <a href={links[0].href} className="shrink-0">
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
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-bold text-franja-dark hover:text-franja-morada"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <span
          className={cn(
            buttonVariants({ variant: "default" }),
            "hidden h-11 rounded-lg bg-franja-morada px-5 text-sm font-bold text-white lg:inline-flex",
          )}
        >
          Mi cuenta
        </span>
        <button
          type="button"
          className="text-sm font-bold text-franja-morada lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Cerrar" : "☰"}
        </button>
      </div>
      {open ? (
        <nav className="mt-4 flex flex-col gap-3 border-t border-franja-border pt-4 lg:hidden">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-bold text-franja-dark"
            >
              {link.label}
            </a>
          ))}
          <span className="text-sm font-bold text-franja-morada">
            Mi cuenta
          </span>
        </nav>
      ) : null}
      <span className="sr-only">Ruta actual: {currentPath}</span>
    </header>
  );
}
