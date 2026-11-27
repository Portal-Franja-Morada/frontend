import type { ReactNode } from "react";
import type { LegalDocument, LegalSection } from "../types/legal";
import { Footer } from "./Footer";
import { GoldCorner } from "./GoldCorner";
import { Header } from "./Header";
import { LegalIndex } from "./legal/LegalIndex";
import { LegalSectionBody } from "./legal/LegalSectionBody";
import { LegalRichText } from "./legal/LegalRichText";

type LegalDocumentPageProps = {
  document: LegalDocument;
  currentPath: "/privacidad" | "/terminos";
  breadcrumbLabel: string;
  titleDesktop: string;
  titleMobile: ReactNode;
};

function renderSection(section: LegalSection) {
  if (section.slug === "ver-tambien") {
    return (
      <section
        key={section.slug}
        id={section.slug}
        className="scroll-mt-28 border-t border-franja-border pt-10"
      >
        <LegalSectionBody blocks={section.blocks} />
      </section>
    );
  }

  return (
    <section key={section.slug} id={section.slug} className="scroll-mt-28">
      <LegalSectionBody blocks={section.blocks} />
    </section>
  );
}

export function LegalDocumentPage({
  document,
  currentPath,
  breadcrumbLabel,
  titleDesktop,
  titleMobile,
}: LegalDocumentPageProps) {
  const contentSections = document.sections.filter(
    (section) => section.slug !== "ver-tambien",
  );
  const relatedSection = document.sections.find(
    (section) => section.slug === "ver-tambien",
  );

  return (
    <>
      <Header currentPath={currentPath} />
      <main>
        <div className="bg-franja-morada px-5 py-6 lg:px-20 lg:py-16">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
            <nav
              aria-label="Recorrido"
              className="hidden text-[13px] font-normal text-white lg:block"
            >
              <a href="/" className="transition-opacity hover:opacity-80">
                Inicio
              </a>
              <span aria-hidden="true"> / </span>
              <span>{breadcrumbLabel}</span>
            </nav>

            <h1 className="text-[26px] leading-[34px] font-bold text-white lg:text-[36px] lg:leading-[44px]">
              <span className="lg:hidden">{titleMobile}</span>
              <span className="hidden lg:inline">{titleDesktop}</span>
            </h1>

            <div className="flex flex-col gap-2 text-white">
              <p className="text-base">
                Última actualización: {document.meta.updatedAt}
              </p>
              <p className="text-[13px]">
                Versión {document.meta.version} · Vigente desde{" "}
                <LegalRichText text={document.meta.effectiveFrom} />
              </p>
            </div>

            <GoldCorner />
          </div>
        </div>

        <div className="bg-franja-surface px-5 py-7 lg:px-20 lg:py-16">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 lg:flex-row lg:gap-24">
            <aside className="lg:sticky lg:top-8 lg:w-80 lg:shrink-0 lg:self-start">
              <LegalIndex items={document.index} />
            </aside>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-10 lg:max-w-[680px] lg:gap-12">
                {contentSections.map((section) => renderSection(section))}
              </div>

              {relatedSection ? (
                <div className="mt-10 lg:mt-12 lg:max-w-[680px]">
                  {renderSection(relatedSection)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
