/**
 * Patches the require cache for server/db so routes use an in-memory mock.
 *
 * Usage: The first import in each test file must be:
 *   await import("./helpers/patch-db.js");  // or .ts via tsx
 *
 * Must run BEFORE any route module is imported.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

// ─── Shared mutable mock state ──────────────────────────────────────

export interface MockDBState {
  queries: { sql: string; params: any[] }[];
  responseQueue: any[];
  handler: ((sql: string, params: any[]) => any) | null;
}

export const mockDB: MockDBState = {
  queries: [],
  responseQueue: [],
  handler: null,
};

export function resetMockDB() {
  mockDB.queries = [];
  mockDB.responseQueue = [];
  mockDB.handler = null;
}

// ─── Mock implementations ───────────────────────────────────────────

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

const poolLike = () => ({
  query: async (...args: any[]) => {
    mockDB.queries.push({ sql: args[0], params: args[1] || [] });
    if (mockDB.handler) return mockDB.handler(args[0], args[1] || []);
    if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
    return [[]];
  },
  getConnection: async () => makeConn(),
});

const mockDbModule = {
  withPlatformConnection: async <T,>(cb: (conn: any) => Promise<T>): Promise<T> => cb(makeConn()),
  withPlatformTransaction: async <T,>(cb: (conn: any) => Promise<T>): Promise<T> => {
    const conn = makeConn();
    try { await conn.beginTransaction(); const r = await cb(conn); await conn.commit(); return r; }
    catch (e) { await conn.rollback(); throw e; }
  },
  getPlatformPool: poolLike,
  getPlatformConnection: async () => makeConn(),
  queryPlatform: async (sql: string, params: any[] = []) => {
    mockDB.queries.push({ sql, params });
    if (mockDB.handler) return mockDB.handler(sql, params);
    if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
    return [[]];
  },
  withBooksConnection: async <T,>(cb: (conn: any) => Promise<T>): Promise<T> => cb(makeConn()),
  getBooksPool: poolLike,
  getBooksConnection: async () => makeConn(),
  queryBooks: async (sql: string, params: any[] = []) => {
    mockDB.queries.push({ sql, params });
    if (mockDB.handler) return mockDB.handler(sql, params);
    if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
    return [[]];
  },
};

// ─── Install ────────────────────────────────────────────────────────

const projectRoot = path.resolve(import.meta.dirname, "../..");

// Resolve using the route file's perspective (server/routes/auth.ts → ../db)
const requireFromRoutes = createRequire(
  pathToFileURL(path.join(projectRoot, "server", "routes", "auth.ts")).href
);

const candidates = [
  path.join(projectRoot, "server", "db.ts"),
  path.join(projectRoot, "server", "db.js"),
  path.join(projectRoot, "server", "db.mjs"),
];

let patched = 0;
for (const p of candidates) {
  try {
    const resolved = requireFromRoutes.resolve(p);
    requireFromRoutes.cache[resolved] = {
      id: resolved,
      filename: resolved,
      loaded: true,
      exports: mockDbModule,
    } as any;
    patched++;
  } catch {
    // Try without .ts extension (Node require strips it)
    try {
      const noExt = p.replace(/\.ts$/, "");
      const resolved = requireFromRoutes.resolve(noExt);
      requireFromRoutes.cache[resolved] = {
        id: resolved,
        filename: resolved,
        loaded: true,
        exports: mockDbModule,
      } as any;
      patched++;
    } catch {}
  }
}

// Also try the require from test file's perspective
const requireFromTests = createRequire(
  pathToFileURL(path.join(projectRoot, "tests", "auth.test.ts")).href
);

for (const p of candidates) {
  try {
    const resolved = requireFromTests.resolve(p);
    requireFromTests.cache[resolved] = {
      id: resolved,
      filename: resolved,
      loaded: true,
      exports: mockDbModule,
    } as any;
    patched++;
  } catch {}
}

// Direct require.resolve from project root
const requireFromRoot = createRequire(
  pathToFileURL(path.join(projectRoot, "package.json")).href
);

for (const rel of ["./server/db.js", "./server/db.ts", "./server/db"]) {
  try {
    const resolved = requireFromRoot.resolve(rel);
    requireFromRoot.cache[resolved] = {
      id: resolved,
      filename: resolved,
      loaded: true,
      exports: mockDbModule,
    } as any;
    patched++;
  } catch {}
}

console.log(`✅ Mock DB installed (${patched} cache entries patched)`);
