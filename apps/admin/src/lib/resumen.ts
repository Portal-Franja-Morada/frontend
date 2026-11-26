export function deriveResumen(cuerpo: string, max = 300): string {
  const plain = cuerpo
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>#-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return "";
  }

  const sentenceEnd = plain.search(/[.!?]\s/);
  if (sentenceEnd > 20 && sentenceEnd < max) {
    return plain.slice(0, sentenceEnd + 1).trim();
  }

  return plain.length <= max ? plain : `${plain.slice(0, max - 1).trim()}…`;
}
