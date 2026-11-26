import type { AdminContentStats } from "../types/content";

type PostsStatsProps = {
  stats: AdminContentStats | null;
};

const items = [
  { key: "total" as const, label: "En total" },
  { key: "publicados" as const, label: "Publicados" },
  { key: "borradores" as const, label: "Borradores" },
];

export function PostsStats({ stats }: PostsStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-[10px] border border-franja-border bg-white p-4"
        >
          <p className="text-[26px] font-bold leading-none text-franja-dark">
            {stats ? stats[item.key] : "—"}
          </p>
          <p className="mt-2 text-[13px] text-franja-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
