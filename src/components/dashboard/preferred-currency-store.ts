export const preferredCurrencyStore = {
  listeners: new Set<() => void>(),
  subscribe(onStoreChange: () => void) {
    preferredCurrencyStore.listeners.add(onStoreChange);
    window.addEventListener("storage", onStoreChange);
    return () => {
      preferredCurrencyStore.listeners.delete(onStoreChange);
      window.removeEventListener("storage", onStoreChange);
    };
  },
  getSnapshot() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("preferred_currency") || "EUR";
    }
    return "EUR";
  },
  getServerSnapshot() {
    return "EUR";
  },
  set(val: string) {
    localStorage.setItem("preferred_currency", val);
    for (const listener of preferredCurrencyStore.listeners) listener();
  },
};
