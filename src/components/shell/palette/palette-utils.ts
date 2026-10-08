import { useEffect, useState } from "react";

const RECENT_KEY = "gravio:recent-searches";
const MAX_RECENT = 5;

export function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeRecent(term: string) {
  try {
    const next = [term, ...readRecent().filter((t) => t !== term)].slice(
      0,
      MAX_RECENT,
    );
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

export function clearRecent() {
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {}
}

export function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function matches(text: string, q: string) {
  return norm(text).includes(norm(q));
}
