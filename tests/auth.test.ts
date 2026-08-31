/**
 * API route tests for /api/auth endpoints.
 *
 * Covers: register, login, refresh, /me, logout, change-password, forgot-password.
 * Uses an in-memory mock DB — no MySQL required.
 *
 * Run: tsx --import ./tests/helpers/register.ts --test tests/auth.test.ts
 */
import "./helpers/register.js";

import test, { describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mockDB, resetMockDB } from "./helpers/mock-db-module.js";
import { createAuthRouter } from "../server/routes/auth.js";
import {
  signTestToken,
  signTestRefreshToken,
  createTestApp,
  request,
  assertError,
  authHeader,
} from "./helpers/setup.js";

// Ensure JWT secret is set for the auth middleware
process.env.JWT_SECRET = "test_jwt_secret_for_auth_tests";

const router = createAuthRouter();
const app = createTestApp(router);

// Clear the setInterval in createAuthRouter to allow process to exit
if ((router as any)._cleanupInterval) {
  clearInterval((router as any)._cleanupInterval);
}

describe("Auth routes", () => {
  afterEach(() => {
    resetMockDB();
  });

  // ─── POST /register ────────────────────────────────────────────────

  describe("POST /register", () => {
    test("returns 400 when email is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/register",
        body: { password: "Test1234!", firstName: "John" },
      });
      assertError(res, 400);
      assert.ok(res.body.error.includes("required"));
    });

    test("returns 400 when password is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/register",
        body: { email: "test@example.com", firstName: "John" },
      });
      assertError(res, 400);
    });

    test("returns 400 when firstName is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/register",
        body: { email: "test@example.com", password: "Test1234!" },
      });
      assertError(res, 400);
    });

    test("returns 400 for invalid email format", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/register",
        body: { email: "not-an-email", password: "Test1234!", firstName: "John" },
      });
      assertError(res, 400);
      assert.ok(res.body.error.includes("Invalid email"));
    });

    test("returns 400 for password shorter than 8 chars", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/register",
        body: { email: "test@example.com", password: "short", firstName: "John" },
      });
      assertError(res, 400);
      assert.ok(res.body.error.includes("8 characters"));
    });

    test("returns 409 when email already exists", async () => {
      // Mock: existing user check returns a user
      mockDB.responseQueue.push([[{ id: "existing_user" }]]);

      const res = await request(app, {
        method: "POST",
        path: "/api/register",
        body: { email: "dup@example.com", password: "Test1234!", firstName: "John" },
      });
      assertError(res, 409);
      assert.ok(res.body.error.includes("already exists"));
    });

    test("returns 201 on successful registration", async () => {
      // Query sequence: SELECT existing user → empty, INSERT user, INSERT session
      mockDB.responseQueue.push([[]]);
      mockDB.responseQueue.push({});
      mockDB.responseQueue.push({});

      const res = await request(app, {
        method: "POST",
        path: "/api/register",
        body: {
          email: "new@example.com",
          password: "StrongP@ss1",
          firstName: "Jane",
          lastName: "Doe",
          phone: "9876543210",
        },
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.user);
      assert.equal(res.body.user.email, "new@example.com");
      assert.ok(res.body.accessToken);
      assert.ok(res.body.refreshToken);
    });

    test("always assigns CLIENT role regardless of requested role", async () => {
      mockDB.responseQueue.push([[]]);
      mockDB.responseQueue.push({});
      mockDB.responseQueue.push({});

      const res = await request(app, {
        method: "POST",
        path: "/api/register",
        body: {
          email: "hacker@example.com",
          password: "StrongP@ss1",
          firstName: "Evil",
          role: "SUPER_ADMIN",
        },
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.role, "CLIENT");
    });
  });

  // ─── POST /login ───────────────────────────────────────────────────

  describe("POST /login", () => {
    test("returns 400 when email is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/login",
        body: { password: "Test1234!" },
      });
      assertError(res, 400);
    });

    test("returns 400 when password is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/login",
        body: { email: "test@example.com" },
      });
      assertError(res, 400);
    });

    test("returns 401 for invalid credentials (user not found)", async () => {
      mockDB.responseQueue.push([[]]); // no user found

      const res = await request(app, {
        method: "POST",
        path: "/api/login",
        body: { email: "nobody@example.com", password: "Test1234!" },
      });
      assertError(res, 401);
      assert.ok(res.body.error.includes("Invalid email or password"));
    });

    test("returns 200 on successful login", async () => {
      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.hash("Test1234!", 1);

      mockDB.responseQueue.push([[{
        id: "usr_test123",
        email: "user@example.com",
        passwordHash: hash,
        firstName: "Test",
        lastName: "User",
        role: "CLIENT",
        isActive: 1,
      }]]);
      mockDB.responseQueue.push({}); // UPDATE lastLoginAt
      mockDB.responseQueue.push({}); // INSERT session

      const res = await request(app, {
        method: "POST",
        path: "/api/login",
        body: { email: "user@example.com", password: "Test1234!" },
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.accessToken);
      assert.ok(res.body.refreshToken);
      assert.equal(res.body.user.email, "user@example.com");
    });

    test("returns 401 for wrong password", async () => {
      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.hash("CorrectPassword", 1);

      mockDB.responseQueue.push([[{
        id: "usr_test",
        email: "user@example.com",
        passwordHash: hash,
        firstName: "Test",
        lastName: "User",
        role: "CLIENT",
        isActive: 1,
      }]]);

      const res = await request(app, {
        method: "POST",
        path: "/api/login",
        body: { email: "user@example.com", password: "WrongPassword" },
      });
      assertError(res, 401);
    });

    test("returns 403 for deactivated account", async () => {
      mockDB.responseQueue.push([[{
        id: "usr_deactivated",
        email: "deactivated@example.com",
        passwordHash: "dummy",
        firstName: "De",
        lastName: "Activated",
        role: "CLIENT",
        isActive: 0,
      }]]);

      const res = await request(app, {
        method: "POST",
        path: "/api/login",
        body: { email: "deactivated@example.com", password: "Test1234!" },
      });
      assertError(res, 403);
      assert.ok(res.body.error.includes("deactivated"));
    });

    test("fallback admin login works with correct credentials", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/login",
        body: {
          email: process.env.ADMIN_EMAIL || "d.bhushan@incroute.com",
          password: process.env.ADMIN_PASSWORD || "Admin@2026",
        },
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, "SUPER_ADMIN");
      assert.equal(res.body.user.id, "admin_fallback");
    });
  });

  // ─── POST /refresh ─────────────────────────────────────────────────

  describe("POST /refresh", () => {
    test("returns 400 when refreshToken is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/refresh",
        body: {},
      });
      assertError(res, 400);
    });

    test("returns 200 with a new access token for valid refresh token", async () => {
      const refreshToken = signTestRefreshToken("usr_test");
      mockDB.responseQueue.push([[{ id: "usr_test", email: "user@example.com", role: "CLIENT", isActive: 1 }]]);

      const res = await request(app, {
        method: "POST",
        path: "/api/refresh",
        body: { refreshToken },
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.accessToken);
    });

    test("returns 401 for expired refresh token", async () => {
      const jwt = await import("jsonwebtoken");
      const expiredToken = jwt.default.sign(
        { userId: "usr_test", sessionId: "sess_001", type: "refresh", exp: Math.floor(Date.now() / 1000) - 3600 },
        process.env.JWT_SECRET || "test_jwt_secret_for_auth_tests"
      );

      const res = await request(app, {
        method: "POST",
        path: "/api/refresh",
        body: { refreshToken: expiredToken },
      });
      assertError(res, 401);
    });

    test("returns 401 for non-refresh token type", async () => {
      const accessToken = signTestToken({ userId: "usr_test", email: "a@b.com", role: "CLIENT" });

      const res = await request(app, {
        method: "POST",
        path: "/api/refresh",
        body: { refreshToken: accessToken },
      });
      assertError(res, 401);
      assert.ok(res.body.error.includes("Invalid token type"));
    });

    test("admin fallback refresh works", async () => {
      const refreshToken = signTestRefreshToken("admin_fallback", "fallback_123");

      const res = await request(app, {
        method: "POST",
        path: "/api/refresh",
        body: { refreshToken },
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.accessToken);
    });
  });

  // ─── GET /me ───────────────────────────────────────────────────────

  describe("GET /me", () => {
    test("returns 401 without auth token", async () => {
      const res = await request(app, { path: "/api/me" });
      assertError(res, 401);
    });

    test("returns 200 with user profile for valid token", async () => {
      const token = signTestToken({ userId: "usr_test", email: "user@example.com", role: "CLIENT" });
      mockDB.responseQueue.push([[{
        id: "usr_test",
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
        role: "CLIENT",
        phone: "9876543210",
        isActive: 1,
        createdAt: "2026-01-01",
      }]]);

      const res = await request(app, {
        path: "/api/me",
        headers: authHeader(token),
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.email, "user@example.com");
    });

    test("admin fallback user returns profile without DB query", async () => {
      const token = signTestToken({ userId: "admin_fallback", email: "admin@test.com", role: "SUPER_ADMIN" });

      const res = await request(app, {
        path: "/api/me",
        headers: authHeader(token),
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.id, "admin_fallback");
      assert.equal(res.body.user.role, "SUPER_ADMIN");
    });
  });

  // ─── POST /logout ──────────────────────────────────────────────────

  describe("POST /logout", () => {
    test("returns 200 even without token", async () => {
      const res = await request(app, { method: "POST", path: "/api/logout" });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });

    test("deactivates session with valid token", async () => {
      const token = signTestToken({ userId: "usr_test", email: "a@b.com", role: "CLIENT", sessionId: "sess_del_001" });

      const res = await request(app, {
        method: "POST",
        path: "/api/logout",
        headers: authHeader(token),
      });

      assert.equal(res.status, 200);
      const sessionCalls = mockDB.queries.filter((q) => q.sql.includes("UPDATE") && q.sql.includes("Session"));
      assert.ok(sessionCalls.length > 0, "Expected session deactivation query");
    });
  });

  // ─── POST /change-password ─────────────────────────────────────────

  describe("POST /change-password", () => {
    test("returns 401 without auth token", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/change-password",
        body: { currentPassword: "old", newPassword: "new12345" },
      });
      assertError(res, 401);
    });

    test("returns 400 when current/new password missing", async () => {
      const token = signTestToken({ userId: "usr_test", email: "a@b.com", role: "CLIENT" });
      const res = await request(app, {
        method: "POST",
        path: "/api/change-password",
        headers: authHeader(token),
        body: {},
      });
      assertError(res, 400);
    });

    test("returns 400 for admin_fallback user", async () => {
      const token = signTestToken({ userId: "admin_fallback", email: "admin@test.com", role: "SUPER_ADMIN" });
      const res = await request(app, {
        method: "POST",
        path: "/api/change-password",
        headers: authHeader(token),
        body: { currentPassword: "old", newPassword: "new12345" },
      });
      assertError(res, 400);
      assert.ok(res.body.error.includes("fallback"));
    });

    test("returns 401 when current password is incorrect", async () => {
      const bcrypt = await import("bcryptjs");
      const correctHash = await bcrypt.hash("CorrectPassword", 1);
      const token = signTestToken({ userId: "usr_test", email: "a@b.com", role: "CLIENT" });

      mockDB.responseQueue.push([[{ id: "usr_test", passwordHash: correctHash }]]);

      const res = await request(app, {
        method: "POST",
        path: "/api/change-password",
        headers: authHeader(token),
        body: { currentPassword: "WrongPassword", newPassword: "NewP@ss1234" },
      });
      assertError(res, 401);
      assert.ok(res.body.error.includes("incorrect"));
    });

    test("returns 200 on successful password change", async () => {
      const bcrypt = await import("bcryptjs");
      const correctHash = await bcrypt.hash("OldP@ss1234", 1);
      const token = signTestToken({ userId: "usr_test", email: "a@b.com", role: "CLIENT" });

      mockDB.responseQueue.push([[{ id: "usr_test", passwordHash: correctHash }]]);
      mockDB.responseQueue.push({}); // UPDATE password

      const res = await request(app, {
        method: "POST",
        path: "/api/change-password",
        headers: authHeader(token),
        body: { currentPassword: "OldP@ss1234", newPassword: "NewP@ss5678" },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });

  // ─── POST /forgot-password ─────────────────────────────────────────

  describe("POST /forgot-password", () => {
    test("returns 400 when email is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/forgot-password",
        body: {},
      });
      assertError(res, 400);
    });

    test("returns 200 even for non-existent email (prevents enumeration)", async () => {
      mockDB.responseQueue.push([[]]);
      const res = await request(app, {
        method: "POST",
        path: "/api/forgot-password",
        body: { email: "nobody@example.com" },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });

    test("returns 200 for existing email", async () => {
      mockDB.responseQueue.push([[{ id: "usr_123", email: "user@example.com" }]]);
      const res = await request(app, {
        method: "POST",
        path: "/api/forgot-password",
        body: { email: "user@example.com" },
      });
      assert.equal(res.status, 200);
    });
  });

  // ─── Cache-Control headers ─────────────────────────────────────────

  describe("Security headers", () => {
    test("auth endpoints set no-cache headers", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/forgot-password",
        body: { email: "test@example.com" },
      });
      const cc = res.headers["cache-control"] || res.headers["Cache-Control"];
      assert.ok(cc, "Expected Cache-Control header");
      assert.ok(cc.includes("no-store"), `Expected no-store in Cache-Control: ${cc}`);
    });
  });
});
