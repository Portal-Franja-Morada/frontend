import { Button } from "@franja/ui/components/button";
import { cn } from "@franja/ui/lib/utils";

type AdminPostsPaginationProps = {
  page: number;
  pages: number;
  from: number;
  to: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function AdminPostsPagination({
  page,
  pages,
  from,
  to,
  total,
  onPageChange,
}: AdminPostsPaginationProps) {
  if (total <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-franja-muted">
        {from}–{to} de {total} novedades
      </p>
      {page < pages ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "h-12 rounded-lg border-franja-border bg-white px-5 text-sm font-bold text-franja-morada hover:bg-franja-surface",
          )}
        >
          Siguiente →
        </Button>
      ) : null}
    </div>
  );
}
