import { quickTools } from "../data/mock";
import { Section } from "./Section";

export function QuickTools() {
  return (
    <Section surface spacing="compact">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {quickTools.map((tool) => (
          <a
            key={tool.title}
            href={tool.href}
            className="flex flex-col gap-1 transition-opacity hover:opacity-80"
          >
            <span className="text-sm font-bold text-franja-morada">
              {tool.title}
            </span>
            <span className="text-[13px] text-franja-muted">
              {tool.description}
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}
