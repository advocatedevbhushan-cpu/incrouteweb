/**
 * Test helpers for API route tests.
 *
 * Provides a lightweight mock of the MySQL connection layer so that
 * routes can be exercised without a live database.  The mock is
 * installed via a dynamic import patch before each test file runs.
 */
import express, { Express, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import assert from "node:assert/strict";

// ─── JWT helpers ────────────────────────────────────────────────────
const TEST_JWT_SECRET = "test_jwt_secret_not_for_production";

export function getTestJwtSecret(): string {
  return process.env.JWT_SECRET || TEST_JWT_SECRET;
}

/** Generate a signed auth token for tests. */
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

/** Generate a signed refresh token for tests. */
export function signTestRefreshToken(userId: string, sessionId = "sess_test_001"): string {
  return jwt.sign({ userId, sessionId, type: "refresh" }, getTestJwtSecret(), {
    expiresIn: "7d",
  });
}

/** Auth header value for a given token. */
export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

// ─── Mock DB layer ──────────────────────────────────────────────────
type QueryResult = any[];

export interface MockQueryCall {
  sql: string;
  params: any[];
}

/**
 * Simple in-memory mock for `withPlatformConnection`.
 * Stores all queries and lets tests configure canned responses.
 */
export class MockPlatformDB {
  /** All queries executed through the mock. */
  calls: MockQueryCall[] = [];
  /** Queue of return values – consumed in FIFO order per `.query()` call. */
  private responseQueue: any[] = [];
  /** Custom handler: if set, called for every query and its return value used. */
  handler: ((sql: string, params: any[]) => any) | null = null;

  /** Push canned responses that will be returned in order. */
  enqueueResponses(...values: any[]) {
    this.responseQueue.push(...values);
  }

  /** Reset all recorded state. */
  reset() {
    this.calls = [];
    this.responseQueue = [];
    this.handler = null;
  }

  /** Simulates `withPlatformConnection(async (conn) => { conn.query(...) })`. */
  async withConnection<T>(cb: (conn: { query: (sql: string, params?: any[]) => Promise<any> }) => Promise<T>): Promise<T> {
    const conn = {
      query: async (sql: string, params: any[] = []) => {
        this.calls.push({ sql, params });
        if (this.handler) return this.handler(sql, params);
        if (this.responseQueue.length > 0) return this.responseQueue.shift();
        return [[]]; // default: empty result set
      },
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {},
    };
    return cb(conn);
  }

  /** Convenience: return the most recent query call. */
  lastCall(): MockQueryCall | undefined {
    return this.calls[this.calls.length - 1];
  }

  /** Convenience: filter calls by SQL pattern. */
  callsMatching(pattern: string | RegExp): MockQueryCall[] {
    const re = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    return this.calls.filter((c) => re.test(c.sql));
  }
}

// ─── Express test-app factory ───────────────────────────────────────

/**
 * Build a minimal Express app mounted at the given prefix.
 * Injects a mock `req.ip` and `req.headers["user-agent"]`.
 */
export function createTestApp(router: express.Router, prefix = "/api"): Express {
  const app = express();
  app.use(express.json());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    // In Node 24+, req.ip is a getter — override it via defineProperty
    Object.defineProperty(req, "ip", { value: "127.0.0.1", writable: true, configurable: true });
    req.headers["user-agent"] = "test-agent";
    next();
  });
  app.use(prefix, router);
  // Catch-all error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

// ─── Lightweight HTTP client (no supertest dep) ─────────────────────

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface ReqOptions {
  method?: Method;
  path: string;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Makes an HTTP request to an Express app using Node's built-in http module.
 * Returns a parsed response.
 */
export async function request(
  app: Express,
  opts: ReqOptions
): Promise<{ status: number; body: any; headers: Record<string, string> }> {
  const http = await import("node:http");
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const addr = server.address() as any;
      const method = opts.method || "GET";
      const payload = opts.body ? JSON.stringify(opts.body) : undefined;

      const reqOpts: any = {
        hostname: "127.0.0.1",
        port: addr.port,
        path: opts.path,
        method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "test-agent",
          ...(opts.headers || {}),
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      };

      const req = http.request(reqOpts, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          server.close();
          let body: any;
          try {
            body = JSON.parse(data);
          } catch {
            body = data;
          }
          const responseHeaders: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.headers)) {
            if (typeof v === "string") responseHeaders[k] = v;
          }
          resolve({ status: res.statusCode || 0, body, headers: responseHeaders });
        });
      });

      req.on("error", (err) => {
        server.close();
        reject(err);
      });

      if (payload) req.write(payload);
      req.end();
    });
  });
}

// ─── Assertion helpers ──────────────────────────────────────────────

export function assertSuccess(res: { status: number; body: any }, expectedStatus = 200) {
  assert.equal(res.status, expectedStatus, `Expected status ${expectedStatus} but got ${res.status}: ${JSON.stringify(res.body)}`);
  assert.ok(res.body.success !== false, `Expected success but got: ${JSON.stringify(res.body)}`);
}

export function assertError(res: { status: number; body: any }, expectedStatus: number) {
  assert.equal(res.status, expectedStatus, `Expected status ${expectedStatus} but got ${res.status}: ${JSON.stringify(res.body)}`);
}
