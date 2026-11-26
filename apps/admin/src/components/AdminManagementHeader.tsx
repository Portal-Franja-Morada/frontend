import { buttonVariants } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { getLandingSiteUrl } from "../lib/constants";

const navItems = [
  { label: "Panel de gestión", to: "/" },
  { label: "Novedades", to: "/novedades" },
  { label: "Eventos", to: "/eventos" },
] as const;

export function AdminManagementHeader() {
  const location = useLocation();
  const landingUrl = getLandingSiteUrl();

  return (
    <header className="border-b border-franja-border bg-white px-5 py-5.5 lg:px-20 lg:py-[22px]">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6">
        <Link
          to="/"
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
        </Link>

        <nav
          className="hidden items-center gap-7.5 lg:flex"
          aria-label="Administración"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "text-sm font-bold",
                location.pathname === item.to ||
                  (item.to !== "/" && location.pathname.startsWith(item.to))
                  ? "text-franja-morada"
                  : "text-franja-dark",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href={landingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-11 rounded-lg bg-franja-morada px-5 text-sm font-bold text-white hover:bg-franja-morada/90",
          )}
        >
          Ver sitio ↗
        </a>
      </div>
    </header>
  );
}
