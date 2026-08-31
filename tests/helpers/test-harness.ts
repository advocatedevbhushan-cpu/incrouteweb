/**
 * Test harness that provides mock-DB-wrapped route factories.
 *
 * Strategy: Instead of fighting ESM module mocking, we:
 * 1. Use tsx's require() internals to intercept server/db
 * 2. The mock state object is exported for test configuration
 *
 * Call `installMock()` BEFORE importing any route modules.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

// ─── Mock state ─────────────────────────────────────────────────────

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

export function enqueue(...values: any[]) {
  mockDB.responseQueue.push(...values);
}

// ─── Mock implementation ────────────────────────────────────────────

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
  queryPlatform: async (sql: string, params: any[] = []) => {
    mockDB.queries.push({ sql, params });
    if (mockDB.handler) return mockDB.handler(sql, params);
    if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
    return [[]];
  },
  withBooksConnection: async <T>(cb: (conn: any) => Promise<T>): Promise<T> => cb(makeConn()),
  getBooksPool: poolLike,
  getBooksConnection: async () => makeConn(),
  queryBooks: async (sql: string, params: any[] = []) => {
    mockDB.queries.push({ sql, params });
    if (mockDB.handler) return mockDB.handler(sql, params);
    if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
    return [[]];
  },
};

// ─── Module cache patching ──────────────────────────────────────────

let installed = false;

/**
 * Patches the require cache for server/db so that any route module
 * that imports from "../db" or "../../server/db" gets our mock.
 *
 * Must be called BEFORE importing route modules.
 */
export function installMock() {
  if (installed) return;
  installed = true;

  const projectRoot = path.resolve(import.meta.dirname, "../../");
  const require = createRequire(pathToFileURL(path.join(projectRoot, "server", "routes", "auth.ts")).href);

  // Find and patch all possible resolutions of server/db
  const paths = [
    path.join(projectRoot, "server", "db.ts"),
    path.join(projectRoot, "server", "db.js"),
    path.join(projectRoot, "server", "db.mjs"),
    path.join(projectRoot, "server", "db.cjs"),
  ];

  for (const p of paths) {
    const fileUrl = pathToFileURL(p).href;
    // Patch require cache using file URL
    try {
      const resolved = require.resolve(p);
      require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports: mockExports } as any;
    } catch {}
    // Also patch using file:// URL (tsx may use this)
    try {
      require.cache[fileUrl] = { id: fileUrl, filename: fileUrl, loaded: true, exports: mockExports } as any;
    } catch {}
  }

  // Also try to patch Module._cache directly (covers ESM loader)
  try {
    const Module = await import("node:module");
    for (const p of paths) {
      const fileUrl = pathToFileURL(p).href;
      for (const key of [p, fileUrl, fileUrl.replace(".ts", ".js"), fileUrl.replace(".js", ".ts")]) {
        // @ts-ignore
        if (Module._cache) {
          // @ts-ignore
          Module._cache[key] = { id: key, filename: key, loaded: true, exports: mockExports };
        }
      }
    }
  } catch {}

  console.log("✅ Mock DB installed via test harness");
}

// ─── Token helpers (re-exported from setup.ts for convenience) ──────

import jwt from "jsonwebtoken";

const TEST_JWT_SECRET = "test_jwt_secret_for_auth_tests";

export function getTestJwtSecret(): string {
  return process.env.JWT_SECRET || TEST_JWT_SECRET;
}

export function signTestToken(payload: {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}): string {
  return jwt.sign(
    { ...payload, sessionId: payload.sessionId || "sess_test_001" },
    getTestJwtSecret(),
    { expiresIn: "1h" }
  );
}

export function signTestRefreshToken(userId: string, sessionId = "sess_test_001"): string {
  return jwt.sign({ userId, sessionId, type: "refresh" }, getTestJwtSecret(), {
    expiresIn: "7d",
  });
}
