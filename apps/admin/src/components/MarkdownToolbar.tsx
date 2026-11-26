import { applyMarkdownAction } from "../lib/markdown-toolbar";

type MarkdownToolbarProps = {
  disabled?: boolean;
  onInsert: (next: string, start: number, end: number) => void;
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

const buttons = [
  { action: "bold" as const, label: "B" },
  { action: "italic" as const, label: "I" },
  { action: "h2" as const, label: "H2" },
  { action: "list" as const, label: "• Lista" },
  { action: "link" as const, label: "Enlace" },
];

export function MarkdownToolbar({
  disabled,
  onInsert,
  value,
  selectionStart,
  selectionEnd,
}: MarkdownToolbarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-3 border-b border-franja-border bg-franja-surface px-3 py-2"
      role="toolbar"
      aria-label="Formato del cuerpo"
    >
      {buttons.map((button) => (
        <button
          key={button.action}
          type="button"
          disabled={disabled}
          className="text-sm font-bold text-franja-dark transition-opacity hover:opacity-80 disabled:opacity-50"
          onClick={() => {
            const result = applyMarkdownAction(
              value,
              selectionStart,
              selectionEnd,
              button.action,
            );
            onInsert(result.next, result.start, result.end);
          }}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
