import { useEffect, useRef } from "react";

type UrlActions = Record<string, (value: string) => void>;

export function useUrlActions(actions: UrlActions, ready = true) {
  const handled = useRef(false);

  const actionsRef = useRef(actions);

  useEffect(() => {
    actionsRef.current = actions;
  });

  useEffect(() => {
    if (!ready || handled.current) return;
    const params = new URLSearchParams(window.location.search);
    let found = false;
    for (const [key, run] of Object.entries(actionsRef.current)) {
      const value = params.get(key);
      if (value !== null) {
        found = true;
        params.delete(key);
        run(value);
      }
    }
    handled.current = true;
    if (found) {
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}`,
      );
    }
  }, [ready]);
}
