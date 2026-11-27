import type { LegalBlock } from "../../types/legal";
import { LegalList, LegalRichText } from "./LegalRichText";
import { LegalProvidersTable } from "./LegalProvidersTable";

type LegalSectionBodyProps = {
  blocks: LegalBlock[];
};

export function LegalSectionBody({ blocks }: LegalSectionBodyProps) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={index} className="text-xl font-bold text-franja-dark">
                <LegalRichText text={block.text} />
              </h2>
            );
          case "subheading":
            return (
              <h3 key={index} className="text-base font-bold text-franja-dark">
                <LegalRichText text={block.text} />
              </h3>
            );
          case "paragraph":
            return (
              <p key={index} className="text-base text-franja-dark">
                <LegalRichText text={block.text} />
              </p>
            );
          case "list":
            return <LegalList key={index} text={block.text} />;
          case "table":
            return <LegalProvidersTable key={index} rows={block.rows} />;
          case "related_label":
            return (
              <p
                key={index}
                className="text-xs font-bold tracking-wide text-franja-muted uppercase"
              >
                {block.text}
              </p>
            );
          case "related_link":
            return (
              <a
                key={index}
                href={block.href}
                className="text-xl font-bold text-franja-morada transition-opacity hover:opacity-80"
              >
                {block.text}
              </a>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
