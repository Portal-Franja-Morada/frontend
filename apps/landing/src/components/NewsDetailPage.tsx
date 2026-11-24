import { buttonVariants } from "@franja/ui/components/button";
import { EmptyState } from "@franja/ui/components/empty-state";
import { ErrorState } from "@franja/ui/components/error-state";
import { LoadingState } from "@franja/ui/components/loading-state";
import { cn } from "@franja/ui/lib/utils";
import { useCallback, useState } from "react";
import { usePostDetail } from "../hooks/use-post-detail";
import { Footer } from "./Footer";
import { GoldCorner } from "./GoldCorner";
import { Header } from "./Header";
import { PostMarkdown } from "./PostMarkdown";

export function NewsDetailPage() {
  const { post, dataState, retry } = usePostDetail();
  const [shareMessage, setShareMessage] = useState("");
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/novedades";

  const breadcrumbTitle = post?.title ?? null;

  const handleShare = useCallback(async () => {
    if (!post) {
      return;
    }

    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
        setShareMessage("");
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareMessage("Enlace copiado al portapapeles.");
      window.setTimeout(() => setShareMessage(""), 3000);
    } catch {
      setShareMessage("");
    }
  }, [post]);

  return (
    <>
      <Header currentPath={currentPath} />
      <main>
        <div className="bg-franja-morada px-5 py-6 lg:px-20 lg:py-16">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
            <nav
              aria-label="Recorrido"
              className="text-[13px] font-normal text-white"
            >
              <a href="/" className="transition-opacity hover:opacity-80">
                Inicio
              </a>
              <span aria-hidden="true"> / </span>
              <a
                href="/novedades"
                className="transition-opacity hover:opacity-80"
              >
                Novedades
              </a>
              {breadcrumbTitle ? (
                <>
                  <span aria-hidden="true"> / </span>
                  <span>{breadcrumbTitle}</span>
                </>
              ) : null}
            </nav>

            {post ? (
              <h1 className="text-[26px] leading-[34px] font-bold text-white uppercase lg:text-[36px] lg:leading-[44px]">
                {post.title}
              </h1>
            ) : null}

            <GoldCorner />
          </div>
        </div>

        <div className="px-5 py-6 lg:px-60 lg:py-16">
          <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
            {dataState === "cargando" ? <LoadingState /> : null}
            {dataState === "vacio" ? (
              <EmptyState message="Esta novedad ya no está disponible." />
            ) : null}
            {dataState === "error" ? <ErrorState onRetry={retry} /> : null}

            {dataState === "ok" && post ? (
              <article className="flex flex-col gap-6">
                <p className="text-xs font-bold text-franja-morada">
                  {post.publishedAtLabel}
                </p>

                <img
                  src={post.image}
                  alt={post.imageAlt}
                  className="h-[220px] w-full rounded-xl object-cover lg:h-[400px]"
                  width={960}
                  height={400}
                />

                <p className="text-card-title font-bold text-franja-dark">
                  {post.summary}
                </p>

                <PostMarkdown content={post.body} />

                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => void handleShare()}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "h-12 w-full rounded-lg bg-franja-gold px-[22px] py-3.5 text-sm font-bold text-franja-morada hover:bg-franja-gold/90 lg:w-fit",
                    )}
                  >
                    Compartir novedad
                  </button>
                  {shareMessage ? (
                    <p
                      className="text-[13px] text-franja-muted"
                      role="status"
                      aria-live="polite"
                    >
                      {shareMessage}
                    </p>
                  ) : null}
                </div>

                <a
                  href="/novedades"
                  className="text-sm font-bold text-franja-morada transition-opacity hover:opacity-80"
                >
                  ← Volver a novedades
                </a>
              </article>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
