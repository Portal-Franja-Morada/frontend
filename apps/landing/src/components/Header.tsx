import { buttonVariants } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import { navLinks } from "../data/site";

// Pastilla deslizante del menú de escritorio. Técnica de "Tab Pill"
// (DesignBookmark, https://designbookmark.com/motion#db-tab-pill):
// dos resortes, uno por borde. El borde que va hacia el
// destino es rígido y el de atrás es blando, así la pastilla se estira y
// después la cola la alcanza. Como el sitio navega con recarga completa, la
// pastilla previsualiza el ítem bajo el mouse o el foco de teclado y vuelve al
// ítem activo al salir. El clic navega normal.
const NAV_PILL_LEAD = { k: 620, c: 40 };
const NAV_PILL_TRAIL = { k: 170, c: 19 };
const NAV_PILL_SUBSTEPS = 4;

type NavPillSpring = { x: number; v: number; t: number; k: number; c: number };

function useNavPill(activeIndex: number) {
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;

    const links = Array.from(
      nav.querySelectorAll<HTMLAnchorElement>("a[data-nav-link]"),
    );
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const A: NavPillSpring = { x: 0, v: 0, t: 0, ...NAV_PILL_TRAIL };
    const B: NavPillSpring = { x: 0, v: 0, t: 0, ...NAV_PILL_LEAD };
    let cur = -1;
    let hoverIndex = -1;
    let focusIndex = -1;
    let lastInput: "hover" | "focus" = "hover";
    let raf = 0;
    let last = 0;
    let disposed = false;

    const render = () => {
      pill.style.transform = `translateX(${A.x.toFixed(2)}px)`;
      pill.style.width = `${Math.max(0, B.x - A.x).toFixed(2)}px`;
    };

    const step = (s: NavPillSpring, dt: number) => {
      s.v += (-s.k * (s.x - s.t) - s.c * s.v) * dt;
      s.x += s.v * dt;
    };

    const settled = (s: NavPillSpring) =>
      Math.abs(s.x - s.t) < 0.05 && Math.abs(s.v) < 0.05;

    // El rAF corre solo mientras hay movimiento y se corta al asentarse.
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      for (let n = 0; n < NAV_PILL_SUBSTEPS; n++) {
        step(A, dt / NAV_PILL_SUBSTEPS);
        step(B, dt / NAV_PILL_SUBSTEPS);
      }
      if (settled(A) && settled(B)) {
        A.x = A.t;
        B.x = B.t;
        A.v = 0;
        B.v = 0;
        render();
        raf = 0;
        return;
      }
      render();
      raf = requestAnimationFrame(frame);
    };

    const targetIndex = () => {
      if (hoverIndex >= 0 && focusIndex >= 0) {
        return lastInput === "focus" ? focusIndex : hoverIndex;
      }
      if (focusIndex >= 0) return focusIndex;
      if (hoverIndex >= 0) return hoverIndex;
      return activeIndex;
    };

    const place = (snap: boolean) => {
      if (disposed) return;
      const i = targetIndex();
      const el = links[i];
      if (!el || !el.offsetWidth) {
        // Sin ítem destino (o nav oculto en mobile): la pastilla no se ve.
        cur = -1;
        pill.style.opacity = "0";
        return;
      }
      const appearing = cur < 0;
      if (i !== cur && !appearing) {
        // Borde que va hacia el destino: rígido. El de atrás: blando.
        const right = i > cur;
        Object.assign(right ? B : A, NAV_PILL_LEAD);
        Object.assign(right ? A : B, NAV_PILL_TRAIL);
      }
      cur = i;
      A.t = el.offsetLeft;
      B.t = el.offsetLeft + el.offsetWidth;
      pill.style.opacity = "1";
      if (snap || appearing || reduce.matches) {
        cancelAnimationFrame(raf);
        raf = 0;
        A.x = A.t;
        B.x = B.t;
        A.v = 0;
        B.v = 0;
        render();
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const indexOf = (target: EventTarget | null) => {
      const link =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>("a[data-nav-link]")
          : null;
      return link ? links.indexOf(link) : -1;
    };

    const ac = new AbortController();
    const opts = { signal: ac.signal };

    // Hover solo con mouse: en táctil no hay previsualización.
    nav.addEventListener(
      "pointerover",
      (e) => {
        if (e.pointerType !== "mouse") return;
        const i = indexOf(e.target);
        if (i < 0 || i === hoverIndex) return;
        hoverIndex = i;
        lastInput = "hover";
        place(false);
      },
      opts,
    );
    nav.addEventListener(
      "pointerleave",
      () => {
        if (hoverIndex < 0) return;
        hoverIndex = -1;
        place(false);
      },
      opts,
    );
    // Foco: solo el de teclado (:focus-visible), no el que deja un clic.
    nav.addEventListener(
      "focusin",
      (e) => {
        const i = indexOf(e.target);
        if (i < 0 || !(e.target as Element).matches(":focus-visible")) return;
        focusIndex = i;
        lastInput = "focus";
        place(false);
      },
      opts,
    );
    nav.addEventListener(
      "focusout",
      (e) => {
        if (nav.contains(e.relatedTarget as Node | null)) return;
        if (focusIndex < 0) return;
        focusIndex = -1;
        place(false);
      },
      opts,
    );
    window.addEventListener("resize", () => place(true), opts);

    // Tamaño de fuente del navegador, carga de Montserrat, cambio a escritorio.
    const ro = new ResizeObserver(() => place(true));
    ro.observe(nav);
    document.fonts?.ready.then(() => place(true));

    place(true);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      ac.abort();
    };
  }, [activeIndex]);

  return { navRef, pillRef };
}

type HeaderProps = {
  currentPath?: string;
};

function isNavActive(currentPath: string, href: string): boolean {
  if (href === "/") {
    return currentPath === "/" || currentPath === "";
  }

  if (href === "#" || href === "") {
    return false;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function Header({ currentPath = "/" }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const activeIndex = navLinks.findIndex((link) =>
    isNavActive(currentPath, link.href),
  );
  const { navRef, pillRef } = useNavPill(activeIndex);

  return (
    <header className="border-b border-franja-border bg-white px-5 py-5.5 lg:px-20 lg:py-[22px]">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6">
        <a href="/" className="shrink-0">
          <img
            src="/logo.png"
            alt="Franja Morada · Económicas"
            className="h-8 w-auto"
            width={220}
            height={32}
          />
        </a>

        {/* Separación entre textos igual que antes (30 px): 12 + 6 + 12, y
            -mx-3 compensa el padding de los extremos. */}
        <nav
          ref={navRef}
          className="relative -mx-3 hidden items-center gap-1.5 lg:flex"
          aria-label="Navegación principal"
        >
          <span
            ref={pillRef}
            aria-hidden="true"
            className="nav-pill pointer-events-none absolute top-0 bottom-0 left-0 w-0 rounded-full bg-franja-morada/10 opacity-0 transition-opacity duration-150 will-change-transform"
          />
          {navLinks.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              data-nav-link=""
              aria-current={index === activeIndex ? "page" : undefined}
              className={`relative z-[1] rounded-full px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-franja-gold ${
                index === activeIndex
                  ? "text-franja-morada"
                  : "text-franja-dark hover:text-franja-morada"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="/ingresar"
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
                isNavActive(currentPath, link.href)
                  ? "text-franja-morada"
                  : "text-franja-dark"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/ingresar"
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
