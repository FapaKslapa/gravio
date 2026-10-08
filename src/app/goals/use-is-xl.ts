import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(min-width: 1280px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useIsXl() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(min-width: 1280px)").matches,
    () => false,
  );
}
