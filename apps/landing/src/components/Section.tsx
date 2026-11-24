import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
  surface?: boolean;
  spacing?: "default" | "compact";
  id?: string;
};

export function Section({
  children,
  className = "",
  surface = false,
  spacing = "default",
  id,
}: SectionProps) {
  const spacingClass = spacing === "compact" ? "py-6" : "py-6 lg:py-16";

  return (
    <section
      id={id}
      className={`px-5 lg:px-20 ${spacingClass} ${surface ? "bg-franja-surface" : ""} ${className}`}
    >
      <div className="mx-auto w-full max-w-[1280px]">{children}</div>
    </section>
  );
}
