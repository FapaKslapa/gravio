import { CORE_KEYWORDS } from "./keywords-core";
import { FLOW_KEYWORDS } from "./keywords-flow";
import type { ColumnMapping } from "./types";

export type Field = keyof ColumnMapping;

export const KEYWORDS: Record<Field, { exact: string[]; words: string[] }> = {
  ...CORE_KEYWORDS,
  ...FLOW_KEYWORDS,
};

export const DATE_LIKE_HEADER =
  /^(data|date|dato|datum|fecha)\b|\b(data|date|dato) /;
