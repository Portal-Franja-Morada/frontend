import { Button } from "@franja/ui/components/button";
import { useEffect, useState } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ApiError, isNetworkError, verifyEmailToken } from "../lib/auth-api";

type Phase = "loading" | "ok" | "invalid" | "conn-error";

function readToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    new URLSearchParams(window.location.search).get("token")?.trim() ?? null
  );
}

export function VerifyEmailPage() {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setPhase("invalid");
      return;
    }

    void (async () => {
      try {
        await verifyEmailToken(token);
        setPhase("ok");
      } catch (error) {
        if (isNetworkError(error)) {
          setPhase("conn-error");
          return;
        }
        if (error instanceof ApiError) {
          setPhase("invalid");
          return;
        }
        setPhase("conn-error");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header currentPath="/verificar-email" />

      <section className="bg-franja-morada px-5 py-14 text-white lg:px-20 lg:py-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="text-[13px] text-white/90">Inicio / Verificar email</p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight lg:text-[36px]">
            CONFIRMÁ TU EMAIL.
          </h1>
        </div>
      </section>

      <section className="bg-franja-surface px-5 py-10 lg:px-20 lg:py-14">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="rounded-xl bg-white p-6 shadow-sm lg:p-10">
            {phase === "loading" ? (
              <p className="text-base text-franja-muted">Verificando enlace…</p>
            ) : null}

            {phase === "ok" ? (
              <>
                <p className="text-base text-franja-dark">
                  Listo. Tu email quedó confirmado.
                </p>
                <a href="/verificacion" className="mt-6 inline-block">
                  <Button className="h-12 rounded-lg bg-franja-morada px-6 text-sm font-bold text-white hover:bg-franja-morada/90">
                    Continuar verificación
                  </Button>
                </a>
              </>
            ) : null}

            {phase === "invalid" ? (
              <>
                <p className="text-base text-franja-dark">
                  El enlace no es válido o ya venció.
                </p>
                <a href="/ingresar" className="mt-6 inline-block">
                  <Button className="h-12 rounded-lg bg-franja-morada px-6 text-sm font-bold text-white hover:bg-franja-morada/90">
                    Ingresar
                  </Button>
                </a>
              </>
            ) : null}

            {phase === "conn-error" ? (
              <>
                <p className="text-base text-franja-dark">
                  No pudimos verificar el enlace. Probá de nuevo en unos
                  segundos.
                </p>
                <Button
                  type="button"
                  className="mt-6 h-12 rounded-lg bg-franja-morada px-6 text-sm font-bold text-white hover:bg-franja-morada/90"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
