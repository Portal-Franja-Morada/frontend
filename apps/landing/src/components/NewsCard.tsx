import { createElement } from "react";
import type { NewsItem } from "../types/view";

type NewsCardProps = {
  item: NewsItem;
  titleTag?: "h2" | "h3";
};

export function NewsCard({ item, titleTag = "h3" }: NewsCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-franja-border bg-white">
      <img
        src={item.image}
        alt={item.imageAlt}
        className="h-[190px] w-full object-cover lg:h-[200px]"
        width={409}
        height={200}
        loading="lazy"
      />
      <div className="flex flex-col gap-3 p-[22px]">
        <p className="text-xs font-bold text-franja-morada">{item.category}</p>
        {createElement(
          titleTag,
          { className: "text-card-title font-bold text-franja-dark" },
          item.title,
        )}
        <a
          href={item.href}
          className="text-sm font-bold text-franja-morada transition-opacity hover:opacity-80"
        >
          Leé la nota →
        </a>
      </div>
    </article>
  );
}
