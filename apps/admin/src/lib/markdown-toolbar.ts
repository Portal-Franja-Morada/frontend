export type MarkdownWrap =
  | { kind: "wrap"; before: string; after: string }
  | { kind: "prefix"; prefix: string }
  | { kind: "link" };

const actions: Record<string, MarkdownWrap> = {
  bold: { kind: "wrap", before: "**", after: "**" },
  italic: { kind: "wrap", before: "_", after: "_" },
  h2: { kind: "prefix", prefix: "## " },
  list: { kind: "prefix", prefix: "- " },
  link: { kind: "link" },
};

export function applyMarkdownAction(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  action: keyof typeof actions,
): { next: string; start: number; end: number } {
  const rule = actions[action];
  const selected = value.slice(selectionStart, selectionEnd) || "texto";

  if (rule.kind === "wrap") {
    const insertion = `${rule.before}${selected}${rule.after}`;
    const next =
      value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
    const start = selectionStart + rule.before.length;
    const end = start + selected.length;
    return { next, start, end };
  }

  if (rule.kind === "link") {
    const insertion = `[${selected}](https://)`;
    const next =
      value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
    const start = selectionStart + 1;
    const end = start + selected.length;
    return { next, start, end };
  }

  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEnd = value.indexOf("\n", selectionStart);
  const sliceEnd = lineEnd === -1 ? value.length : lineEnd;
  const line = value.slice(lineStart, sliceEnd);
  const prefixed = line.startsWith(rule.prefix)
    ? line.slice(rule.prefix.length)
    : `${rule.prefix}${line}`;
  const next = value.slice(0, lineStart) + prefixed + value.slice(sliceEnd);
  const offset = prefixed.length - line.length;
  return {
    next,
    start:
      selectionStart +
      (line.startsWith(rule.prefix) ? -rule.prefix.length : rule.prefix.length),
    end: selectionEnd + offset,
  };
}
