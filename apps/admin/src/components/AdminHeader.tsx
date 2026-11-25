import { buttonVariants } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";

const navLinks = [
  { label: "Inicio", href: "#" },
  { label: "Novedades", href: "#" },
  { label: "Eventos", href: "#" },
  { label: "Beneficios", href: "#" },
] as const;

export function AdminHeader() {
  return (
    <header className="border-b border-franja-border bg-white px-5 py-5.5 lg:px-20 lg:py-[22px]">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6">
        <a
          href="/"
          className="shrink-0"
          aria-label="Franja Morada · Económicas"
        >
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
            <span
              key={link.label}
              className="text-sm font-bold text-franja-dark"
            >
              {link.label}
            </span>
          ))}
        </nav>

        <span
          className={cn(
            buttonVariants({ variant: "default" }),
            "hidden h-11 rounded-lg bg-franja-morada px-5 text-sm font-bold text-white lg:inline-flex",
          )}
        >
          Ingresar
        </span>
      </div>
    </header>
  );
}
