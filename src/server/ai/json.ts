import { AiParseError } from "./errors";

export function parseModelJson(raw: string): unknown {
  let text = raw.trim();
  text = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const start = text.search(/[{[]/);
  if (start === -1) throw new AiParseError();
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  const end = text.lastIndexOf(close);
  if (end <= start) throw new AiParseError();
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new AiParseError();
  }
}
