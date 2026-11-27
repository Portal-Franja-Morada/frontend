import type { LegalIndexItem } from "../../types/legal";

type LegalIndexProps = {
  items: LegalIndexItem[];
};

export function LegalIndex({ items }: LegalIndexProps) {
  return (
    <nav aria-label="En esta página" className="flex flex-col gap-4">
      <p className="text-xs font-bold tracking-wide text-franja-muted uppercase">
        En esta página
      </p>
      <ol className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.slug}>
            <a
              href={`#${item.slug}`}
              className="flex items-start gap-3 text-left transition-opacity hover:opacity-80"
            >
              <span className="w-6 shrink-0 text-xs font-bold text-franja-gold">
                {item.num}
              </span>
              <span className="text-[13px] font-semibold text-franja-dark">
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
