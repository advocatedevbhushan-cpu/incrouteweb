/**
 * Patches the module cache so that server/db exports are replaced with in-memory mocks.
 *
 * MUST be imported before any route modules in test files.
 * Works with tsx because it transpiles ESM imports to require() calls.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// ── Shared mutable mock state ───────────────────────────────────────
export const mockDB = {
  queries: [] as { sql: string; params: any[] }[],
  responseQueue: [] as any[],
  handler: null as ((sql: string, params: any[]) => any) | null,

  reset() {
    this.queries = [];
    this.responseQueue = [];
    this.handler = null;
  },
  enqueue(...values: any[]) {
    this.responseQueue.push(...values);
  },
};

function makeConn() {
  return {
    query: async (sql: string, params: any[] = []) => {
      mockDB.queries.push({ sql, params });
      if (mockDB.handler) return mockDB.handler(sql, params);
      if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
      return [[]];
    },
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
  };
}

function connQuery(sql: string, params: any[] = []) {
  mockDB.queries.push({ sql, params });
  if (mockDB.handler) return mockDB.handler(sql, params);
  if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
  return [[]];
}

const poolLike = () => ({
  query: connQuery,
  getConnection: async () => makeConn(),
});

const mockExports = {
  withPlatformConnection: async <T>(cb: (conn: any) => Promise<T>): Promise<T> => cb(makeConn()),
  withPlatformTransaction: async <T>(cb: (conn: any) => Promise<T>): Promise<T> => {
    const conn = makeConn();
    try {
      await conn.beginTransaction();
      const result = await cb(conn);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    }
  },
  getPlatformPool: poolLike,
  getPlatformConnection: async () => makeConn(),
  queryPlatform: async (sql: string, params: any[] = []) => connQuery(sql, params),
  withBooksConnection: async <T>(cb: (conn: any) => Promise<T>): Promise<T> => cb(makeConn()),
  getBooksPool: poolLike,
  getBooksConnection: async () => makeConn(),
  queryBooks: async (sql: string, params: any[] = []) => connQuery(sql, params),
};

// Resolve the real db module so we know what cache key to replace.
// Try multiple possible resolution paths.
const paths = [
  "../../server/db",
  "../server/db",
  "../../../server/db",
  "./server/db",
];

for (const p of paths) {
  try {
    const resolved = require.resolve(p);
    require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports: mockExports } as any;
  } catch {
    // not all paths will resolve; that's fine
  }
}

console.log("✅ Mock DB installed");
