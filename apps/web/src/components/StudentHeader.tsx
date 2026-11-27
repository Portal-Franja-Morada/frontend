import { buttonVariants } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getLandingSiteUrl } from "../lib/constants";
import {
  isStudentNavActive,
  studentHeaderNavItems,
  studentNavItems,
} from "../lib/student-nav";

export function StudentHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const landingUrl = getLandingSiteUrl();

  return (
    <header className="border-b border-franja-border bg-white px-5 py-5.5 lg:px-8 lg:py-[22px]">
      <div className="flex w-full items-center justify-between gap-6">
        <Link
          to="/perfil"
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
          aria-label="Navegación del estudiante"
        >
          {studentHeaderNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "text-sm font-bold",
                isStudentNavActive(location.pathname, item.to)
                  ? "text-franja-morada"
                  : "text-franja-dark hover:text-franja-morada",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={landingUrl}
          className={cn(
            buttonVariants({ variant: "default" }),
            "hidden h-11 rounded-lg bg-franja-morada px-5 text-sm font-bold text-white hover:bg-franja-morada/90 lg:inline-flex",
          )}
        >
          Ver sitio
        </a>
        <button
          type="button"
          className="text-sm font-bold text-franja-morada lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="student-mobile-nav"
        >
          {open ? "Cerrar" : "☰"}
        </button>
      </div>
      {open ? (
        <nav
          id="student-mobile-nav"
          className="mt-4 flex flex-col gap-3 border-t border-franja-border pt-4 lg:hidden"
          aria-label="Navegación del estudiante"
        >
          {studentNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "text-sm font-bold",
                isStudentNavActive(location.pathname, item.to)
                  ? "text-franja-morada"
                  : "text-franja-dark",
              )}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a href={landingUrl} className="text-sm font-bold text-franja-morada">
            Ver sitio
          </a>
        </nav>
      ) : null}
    </header>
  );
}
