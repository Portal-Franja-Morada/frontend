import { cn } from "@franja/ui/lib/utils";
import type { ReactNode } from "react";

const PLACEHOLDER_PATTERN = /(\[[^\]]+\])/g;
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function formatInlineText(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(PLACEHOLDER_PATTERN);

  return parts.flatMap((part, index) => {
    if (/^\[[^\]]+\]$/.test(part)) {
      return (
        <strong key={`${keyPrefix}-ph-${index}`} className="text-franja-morada">
          {part}
        </strong>
      );
    }

    return part.split(URL_PATTERN).map((urlPart, urlIndex) => {
      if (/^https?:\/\//.test(urlPart)) {
        return (
          <a
            key={`${keyPrefix}-url-${index}-${urlIndex}`}
            href={urlPart}
            className="font-bold text-franja-morada underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {urlPart}
          </a>
        );
      }

      return (
        <span key={`${keyPrefix}-txt-${index}-${urlIndex}`}>{urlPart}</span>
      );
    });
  });
}

type LegalRichTextProps = {
  text: string;
  className?: string;
};

export function LegalRichText({ text, className }: LegalRichTextProps) {
  return (
    <span className={cn(className)}>{formatInlineText(text, "line")}</span>
  );
}

type LegalListProps = {
  text: string;
};

export function LegalList({ text }: LegalListProps) {
  const items = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <ul className="flex list-disc flex-col gap-3 pl-5 text-base text-franja-dark">
      {items.map((item, index) => (
        <li key={index}>
          <LegalRichText text={item} />
        </li>
      ))}
    </ul>
  );
}
