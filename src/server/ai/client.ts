import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  AiParseError,
  AiQuotaError,
  AiTimeoutError,
  AiUnavailableError,
} from "./errors";
import { parseModelJson } from "./json";

export const AI_MODEL = "@cf/google/gemma-4-26b-a4b-it";

export type AiContentPart =
  | { type: "text"; text: string }
  | {
      type: "image_url";
      image_url: { url: string; detail?: "auto" | "low" | "high" };
    };

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string | AiContentPart[];
};

export type RunModelOptions = {
  messages: AiMessage[];
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
};

type AiBinding = {
  run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
};

function classify(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (/429|3040|neurons?|quota|capacity|rate.?limit|daily/i.test(msg)) {
    return new AiQuotaError();
  }
  if (/model|5\d\d|unavailable|not found|overloaded|internal/i.test(msg)) {
    return new AiUnavailableError();
  }
  return new AiUnavailableError();
}

function extractText(res: unknown): string {
  const r = res as {
    choices?: { message?: { content?: string | null } }[];
    response?: unknown;
  };
  const content = r?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content;
  if (typeof r?.response === "string") return r.response;
  if (r?.response && typeof r.response === "object") {
    return JSON.stringify(r.response);
  }
  throw new AiParseError();
}

/** Runs the Workers AI model and returns the raw text of the first choice. */
export async function runModel(opts: RunModelOptions): Promise<string> {
  const ai = (getCloudflareContext().env as { AI?: AiBinding }).AI;
  if (!ai) throw new AiUnavailableError();

  const input: Record<string, unknown> = {
    messages: opts.messages,
    max_completion_tokens: opts.maxTokens ?? 1200,
    temperature: opts.temperature ?? 0.1,
  };
  if (opts.json) input.response_format = { type: "json_object" };

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new AiTimeoutError());
    }, opts.timeoutMs ?? 40_000);
  });

  try {
    const res = await Promise.race([ai.run(AI_MODEL, input), timeout]);
    return extractText(res);
  } catch (err) {
    if (
      err instanceof AiTimeoutError ||
      err instanceof AiParseError ||
      err instanceof AiUnavailableError
    ) {
      throw err;
    }
    throw classify(err);
  } finally {
    clearTimeout(timer);
  }
}

/** Runs the model in JSON mode and returns the parsed (unvalidated) value. */
export async function runModelJson(opts: Omit<RunModelOptions, "json">) {
  const text = await runModel({ ...opts, json: true });
  return parseModelJson(text);
}
