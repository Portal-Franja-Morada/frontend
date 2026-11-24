import { buttonVariants } from "@franja/ui/components/button";
import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import type { DataState } from "../lib/data-state";
import type { NewsItem } from "../types/view";
import { Section } from "./Section";

type LatestNewsProps = {
  dataState: DataState;
  news: NewsItem[];
  onRetry: () => void;
};

export function LatestNews({ dataState, news, onRetry }: LatestNewsProps) {
  return (
    <Section surface id="novedades">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-section leading-section font-bold text-franja-dark">
            LO QUE TENÉS QUE SABER
          </h2>
          <p className="mt-2 text-base text-franja-muted">
            Enterate de lo que pasa en Económicas.
          </p>
        </div>

        {dataState === "cargando" ? <LoadingState /> : null}
        {dataState === "vacio" ? (
          <EmptyState message="Novedades: todavía no hay publicaciones." />
        ) : null}
        {dataState === "error" ? <ErrorState onRetry={onRetry} /> : null}

        {dataState === "ok" ? (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {news.map((item) => (
                <article
                  key={item.slug}
                  className="flex flex-col overflow-hidden rounded-xl border border-franja-border bg-white"
                >
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="h-[190px] w-full object-cover lg:h-[200px]"
                    width={409}
                    height={200}
                    loading="lazy"
                  />
                  <div className="flex flex-col gap-3 p-5">
                    <p className="text-xs font-bold text-franja-morada">
                      {item.category}
                    </p>
                    <h3 className="text-card-title font-bold text-franja-dark">
                      {item.title}
                    </h3>
                    <a
                      href={item.href}
                      className="text-sm font-bold text-franja-morada transition-opacity hover:opacity-80"
                    >
                      Leé la nota →
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <a
              href="#"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-12 w-fit rounded-lg bg-franja-gold px-5.5 text-sm font-bold text-franja-morada hover:bg-franja-gold/90",
              )}
            >
              Ver todas las novedades
            </a>
          </>
        ) : null}
      </div>
    </Section>
  );
}
