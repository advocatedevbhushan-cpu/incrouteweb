/**
 * Mocks the server/db module so that route handlers use an in-memory
 * fake instead of a real MySQL connection.
 *
 * Usage (must be called BEFORE importing any route module):
 *   import { installMockDB, mockDB } from "./helpers/mock-db.js";
 *   installMockDB();
 *   // now safe to import routes – they'll use our mock
 */
import Module from "node:module";

// Shared in-memory state that tests can inspect and configure.
export const mockDB = {
  /** All queries issued through `withPlatformConnection`. */
  queries: Array<{ sql: string; params: any[] }>(),
  /** Queue of canned return values (FIFO). */
  responseQueue: [] as any[],
  /** Optional custom handler – takes precedence over the queue. */
  handler: null as ((sql: string, params: any[]) => any) | null,
  /** Whether a transaction was started. */
  transactionStarted: false,

  reset() {
    this.queries = [];
    this.responseQueue = [];
    this.handler = null;
    this.transactionStarted = false;
  },

  enqueue(...values: any[]) {
    this.responseQueue.push(...values);
  },
};

function mockConn() {
  return {
    query: async (sql: string, params: any[] = []) => {
      mockDB.queries.push({ sql, params });
      if (mockDB.handler) return mockDB.handler(sql, params);
      if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
      return [[]]; // empty result set
    },
    beginTransaction: async () => {
      mockDB.transactionStarted = true;
    },
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
  };
}

let installed = false;

/**
 * Patches `require` so that any import of `../db` (or equivalent)
 * resolves to our mock.  Must be called before routes are loaded.
 */
export function installMockDB() {
  if (installed) return;
  installed = true;

  // Patch both ESM and CJS resolution by hooking into the original loader
  const originalResolve = (Module as any)._resolveFilename;
  (Module as any)._resolveFilename = function (
    request: string,
    parent: any,
    isMain: boolean,
    options: any
  ) {
    // Intercept imports of the db module
    if (
      request === "../db" ||
      request === "../../server/db" ||
      request.endsWith("/server/db") ||
      request === "./db"
    ) {
      return __filename; // resolve to this file
    }
    return originalResolve.call(this, request, parent, isMain, options);
  };

  // Ensure this file exports the db functions when required
  const self = Module as any;
  if (!self.exports.__mockDBInstalled) {
    // The exports of this module ARE the mock db exports when resolved
  }
}

// When this file is `require()`d as the db module, export mock versions.
// For ESM: we handle this via the factory pattern in tests.
export function withPlatformConnection<T>(
  cb: (conn: any) => Promise<T>
): Promise<T> {
  return cb(mockConn());
}

export async function withPlatformTransaction<T>(
  cb: (conn: any) => Promise<T>
): Promise<T> {
  const conn = mockConn();
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

export function getPlatformPool() {
  return {
    query: async (...args: any[]) => {
      mockDB.queries.push({ sql: args[0], params: args[1] || [] });
      if (mockDB.handler) return mockDB.handler(args[0], args[1] || []);
      if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
      return [[]];
    },
    getConnection: async () => mockConn(),
  };
}
