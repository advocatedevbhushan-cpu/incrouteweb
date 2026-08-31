/**
 * Test-specific route factories that use the mock DB.
 *
 * Instead of fighting ESM module mocking, these import the REAL route
 * modules but monkey-patch the withPlatformConnection calls via a
 * thin proxy layer.  The approach:
 *
 * 1. Import the db module normally
 * 2. Override its exports with mock implementations
 * 3. Since the route modules use `import { withPlatformConnection } from "../db"`,
 *    and tsx transpiles this to a CJS-like require, we can intercept via
 *    the tsx loader by re-exporting from a shim.
 *
 * ACTUAL APPROACH: We'll use dynamic import + module patching via
 * the --import flag and a custom loader.
 */
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";

// This file is imported BEFORE any route modules via --import flag.
// It patches the global require so that server/db resolves to our mock.

const require = createRequire(import.meta.url);

// The actual mock DB implementation
function makeConn() {
  return {
    query: async (sql: string, params: any[] = []) => {
      const mod = await import("./mock-state.js");
      mod.mockDB.queries.push({ sql, params });
      if (mod.mockDB.handler) return mod.mockDB.handler(sql, params);
      if (mod.mockDB.responseQueue.length > 0) return mod.mockDB.responseQueue.shift();
      return [[]];
    },
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
  };
}

async function withPlatformConnection(cb: (conn: any) => Promise<any>) {
  return cb(makeConn());
}

async function withPlatformTransaction(cb: (conn: any) => Promise<any>) {
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
}

const poolLike = () => ({
  query: async (...args: any[]) => {
    const mod = await import("./mock-state.js");
    mod.mockDB.queries.push({ sql: args[0], params: args[1] || [] });
    if (mod.mockDB.handler) return mod.mockDB.handler(args[0], args[1] || []);
    if (mod.mockDB.responseQueue.length > 0) return mod.mockDB.responseQueue.shift();
    return [[]];
  },
  getConnection: async () => makeConn(),
});

const mockExports = {
  withPlatformConnection,
  withPlatformTransaction,
  getPlatformPool: poolLike,
  getPlatformConnection: async () => makeConn(),
  queryPlatform: async (sql: string, params: any[] = []) => {
    const mod = await import("./mock-state.js");
    mod.mockDB.queries.push({ sql, params });
    if (mod.mockDB.handler) return mod.mockDB.handler(sql, params);
    if (mod.mockDB.responseQueue.length > 0) return mod.mockDB.responseQueue.shift();
    return [[]];
  },
  withBooksConnection: async (cb: (conn: any) => Promise<any>) => cb(makeConn()),
  getBooksPool: poolLike,
  getBooksConnection: async () => makeConn(),
  queryBooks: async (sql: string, params: any[] = []) => {
    const mod = await import("./mock-state.js");
    mod.mockDB.queries.push({ sql, params });
    if (mod.mockDB.handler) return mod.mockDB.handler(sql, params);
    if (mod.mockDB.responseQueue.length > 0) return mod.mockDB.responseQueue.shift();
    return [[]];
  },
};

// Try to find the actual resolved paths of server/db
const projectRoot = path.resolve(import.meta.dirname, "../../");
const possiblePaths = [
  path.join(projectRoot, "server", "db.ts"),
  path.join(projectRoot, "server", "db.js"),
  path.join(projectRoot, "server", "db.mjs"),
];

// Patch the require cache for all possible CJS resolutions
for (const p of possiblePaths) {
  try {
    const resolved = require.resolve(p);
    require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports: mockExports } as any;
  } catch {}
}

// For ESM resolution, patch the file URL cache
for (const p of possiblePaths) {
  try {
    const fileUrl = pathToFileURL(p).href;
    const fileUrlJs = fileUrl.replace(".ts", ".js");
    for (const url of [fileUrl, fileUrlJs]) {
      // Node's ESM module cache is not directly accessible,
      // but tsx may use require internally
      try {
        const key = require.resolve(url);
        require.cache[key] = { id: key, filename: key, loaded: true, exports: mockExports } as any;
      } catch {}
    }
  } catch {}
}

console.log("✅ Mock DB loader active");
