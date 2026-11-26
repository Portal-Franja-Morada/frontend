import { cn } from "@franja/ui/lib/utils";
import type { ContentEstado } from "../types/content";

const labels: Record<ContentEstado, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
};

type PostStatusBadgeProps = {
  estado: ContentEstado;
};

export function PostStatusBadge({ estado }: PostStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2.5 py-1 text-xs font-bold",
        estado === "publicado"
          ? "bg-[#e8f3ed] text-[#246448]"
          : "bg-franja-rose text-franja-morada",
      )}
    >
      {labels[estado]}
    </span>
  );
}
