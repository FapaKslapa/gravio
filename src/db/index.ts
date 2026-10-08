import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type D1Client = Parameters<typeof drizzle<typeof schema>>[0];

const getD1 = () => {
  try {
    const env = getCloudflareContext()?.env as { DB?: D1Client } | undefined;
    if (env?.DB) {
      return drizzle(env.DB, { schema });
    }
  } catch {
    // Ignore error when outside of request context (e.g. module load or build time)
  }

  // In local node environment (e.g. scripts or build time if not in worker context)
  // we return a dummy drizzle or throw a lazy error if someone tries to query it.
  return new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
    get() {
      throw new Error(
        "D1 Database binding (DB) is not available. Ensure you are running in a Cloudflare worker environment with the binding configured.",
      );
    },
  });
};

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const actualDb = getD1();
    const value = Reflect.get(actualDb, prop);
    if (typeof value === "function") {
      return value.bind(actualDb);
    }
    return value;
  },
});

export type Database = ReturnType<typeof drizzle<typeof schema>>;
export * as schema from "./schema";
