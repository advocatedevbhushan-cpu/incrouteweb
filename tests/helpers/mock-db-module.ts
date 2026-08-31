/**
 * In-memory mock implementation of server/db.ts.
 *
 * Exports the same interface so route modules work unchanged.
 * Tests configure responses via the exported mockDB object.
 */

export interface MockDBState {
  queries: { sql: string; params: any[] }[];
  responseQueue: any[];
  handler: ((sql: string, params: any[]) => any) | null;
}

// Shared mutable state — imported by test files to configure responses
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

function poolLike() {
  return {
    query: async (...args: any[]) => {
      mockDB.queries.push({ sql: args[0], params: args[1] || [] });
      if (mockDB.handler) return mockDB.handler(args[0], args[1] || []);
      if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
      return [[]];
    },
    getConnection: async () => makeConn(),
  };
}

export async function withPlatformConnection<T>(cb: (conn: any) => Promise<T>): Promise<T> {
  return cb(makeConn());
}

export async function withPlatformTransaction<T>(cb: (conn: any) => Promise<T>): Promise<T> {
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

export function getPlatformPool() {
  return poolLike();
}

export async function getPlatformConnection() {
  return makeConn();
}

export async function queryPlatform<T = any>(sql: string, params: any[] = []): Promise<[T, any]> {
  mockDB.queries.push({ sql, params });
  if (mockDB.handler) return mockDB.handler(sql, params) as [T, any];
  if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
  return [[] as any, {}];
}

export async function withBooksConnection<T>(cb: (conn: any) => Promise<T>): Promise<T> {
  return cb(makeConn());
}

export function getBooksPool() {
  return poolLike();
}

export async function getBooksConnection() {
  return makeConn();
}

export async function queryBooks<T = any>(sql: string, params: any[] = []): Promise<[T, any]> {
  mockDB.queries.push({ sql, params });
  if (mockDB.handler) return mockDB.handler(sql, params) as [T, any];
  if (mockDB.responseQueue.length > 0) return mockDB.responseQueue.shift();
  return [[] as any, {}];
}

console.log("✅ Mock DB module loaded (server/db → in-memory mock)");
