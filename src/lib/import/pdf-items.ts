export type PdfItem = { str: string; x: number; y: number; width: number };
export type PdfLine = { text: string; items: { str: string; x: number }[] };

export function itemsToLines(items: PdfItem[]): PdfLine[] {
  const sorted = items
    .filter((i) => i.str.trim() !== "")
    .sort((a, b) => b.y - a.y || a.x - b.x);
  const groups: PdfItem[][] = [];
  for (const it of sorted) {
    const g = groups[groups.length - 1];
    if (g && Math.abs(g[0].y - it.y) <= 3) g.push(it);
    else groups.push([it]);
  }
  return groups.map((g) => {
    g.sort((a, b) => a.x - b.x);
    let text = "";
    let prevEnd: number | null = null;
    for (const it of g) {
      if (prevEnd !== null) {
        const gap = it.x - prevEnd;
        const charW = it.width / Math.max(it.str.length, 1) || 4;
        if (gap > charW * 0.3) text += gap > charW * 2.5 ? "  " : " ";
      }
      text += it.str;
      prevEnd = it.x + it.width;
    }
    return {
      text: text.trim(),
      items: g.map((i) => ({ str: i.str.trim(), x: i.x })),
    };
  });
}
