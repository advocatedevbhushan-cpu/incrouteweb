/**
 * API route tests for /api/admin endpoints.
 *
 * Covers: stats, clients CRUD, tasks CRUD.
 * All admin routes require authentication + admin role.
 *
 * Run: tsx --import ./tests/helpers/register.ts --test tests/admin.test.ts
 */
import "./helpers/register.js";

import test, { describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mockDB, resetMockDB } from "./helpers/mock-db-module.js";
import { createAdminRouter } from "../server/routes/admin.js";
import {
  signTestToken,
  createTestApp,
  request,
  assertError,
  authHeader,
} from "./helpers/setup.js";

process.env.JWT_SECRET = "test_jwt_secret_for_auth_tests";

// Mock email transporter
const mockTransporter = {
  sendMail: async (opts: any) => {
    mockTransporter.calls.push(opts);
    return { messageId: "test-admin-msg" };
  },
  calls: [] as any[],
  reset() {
    this.calls = [];
  },
};

const router = createAdminRouter(mockTransporter, null);
const app = createTestApp(router);

// Auth tokens
const adminToken = signTestToken({ userId: "usr_admin", email: "admin@test.com", role: "SUPER_ADMIN" });
const clientToken = signTestToken({ userId: "usr_client", email: "client@test.com", role: "CLIENT" });

describe("Admin routes", () => {
  afterEach(() => {
    resetMockDB();
    mockTransporter.reset();
  });

  // ─── Auth guards ──────────────────────────────────────────────────

  describe("Authentication & authorization", () => {
    test("returns 401 without auth token", async () => {
      const res = await request(app, { path: "/api/admin/stats" });
      assertError(res, 401);
    });

    test("returns 403 for non-admin role", async () => {
      const res = await request(app, {
        path: "/api/admin/stats",
        headers: authHeader(clientToken),
      });
      assertError(res, 403);
    });

    test("returns 401 for invalid/malformed token", async () => {
      const res = await request(app, {
        path: "/api/admin/stats",
        headers: { Authorization: "Bearer invalid_token_abc123" },
      });
      assertError(res, 401);
    });
  });

  // ─── GET /stats ───────────────────────────────────────────────────

  describe("GET /stats", () => {
    test("returns dashboard stats for admin user", async () => {
      // Mock the various COUNT queries (7 queries + 2 list queries)
      mockDB.responseQueue.push([[{ count: 10 }]]);   // clients
      mockDB.responseQueue.push([[{ count: 5 }]]);    // entities
      mockDB.responseQueue.push([[{ count: 3 }]]);    // compliance
      mockDB.responseQueue.push([[{ count: 2 }]]);    // tickets
      mockDB.responseQueue.push([[{ amount: 50000 }]]); // invoices
      mockDB.responseQueue.push([[{ count: 4 }]]);    // team
      mockDB.responseQueue.push([[{ count: 7 }]]);    // tasks
      mockDB.responseQueue.push([[]]);                 // overdue compliance
      mockDB.responseQueue.push([[]]);                 // recent activity

      const res = await request(app, {
        path: "/api/admin/stats",
        headers: authHeader(adminToken),
      });

      assert.equal(res.status, 200);
      assert.ok(res.body.stats);
      assert.equal(res.body.stats.clients, 10);
      assert.equal(res.body.stats.entities, 5);
      assert.equal(res.body.stats.complianceTasks, 3);
      assert.equal(res.body.stats.openTickets, 2);
      assert.equal(res.body.stats.pendingInvoices, 50000);
      assert.equal(res.body.stats.teamMembers, 4);
      assert.equal(res.body.stats.activeTasks, 7);
      assert.ok(Array.isArray(res.body.overdueCompliance));
      assert.ok(Array.isArray(res.body.recentActivity));
    });
  });

  // ─── GET /clients ─────────────────────────────────────────────────

  describe("GET /clients", () => {
    test("returns list of clients for admin", async () => {
      mockDB.responseQueue.push([[{
        id: "cli_001",
        companyName: "Acme Corp",
        contactName: "John Doe",
        contactEmail: "john@acme.com",
        contactPhone: "9876543210",
        industry: "Technology",
        status: "ACTIVE",
        createdAt: "2026-01-15",
        entityCount: 2,
        avgHealth: 85,
      }]]);

      const res = await request(app, {
        path: "/api/admin/clients",
        headers: authHeader(adminToken),
      });

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.clients));
      assert.equal(res.body.clients.length, 1);
      assert.equal(res.body.clients[0].companyName, "Acme Corp");
      assert.equal(res.body.clients[0].contactEmail, "john@acme.com");
    });

    test("returns empty array when no clients exist", async () => {
      mockDB.responseQueue.push([[]]);

      const res = await request(app, {
        path: "/api/admin/clients",
        headers: authHeader(adminToken),
      });

      assert.equal(res.status, 200);
      assert.deepEqual(res.body.clients, []);
    });
  });

  // ─── POST /clients ────────────────────────────────────────────────

  describe("POST /clients", () => {
    test("returns 400 when companyName is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/admin/clients",
        headers: authHeader(adminToken),
        body: { contactName: "John", contactEmail: "j@acme.com" },
      });
      assertError(res, 400);
    });

    test("returns 400 when contactName is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/admin/clients",
        headers: authHeader(adminToken),
        body: { companyName: "Acme", contactEmail: "j@acme.com" },
      });
      assertError(res, 400);
    });

    test("returns 400 when contactEmail is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/admin/clients",
        headers: authHeader(adminToken),
        body: { companyName: "Acme", contactName: "John" },
      });
      assertError(res, 400);
    });

    test("creates client with user account and activity log", async () => {
      mockDB.responseQueue.push([[]]);   // SELECT existing user → none
      mockDB.responseQueue.push({});     // INSERT Client
      mockDB.responseQueue.push({});     // INSERT Entity
      mockDB.responseQueue.push({});     // INSERT User
      mockDB.responseQueue.push({});     // INSERT Activity

      const res = await request(app, {
        method: "POST",
        path: "/api/admin/clients",
        headers: authHeader(adminToken),
        body: {
          companyName: "New Corp",
          contactName: "Jane Smith",
          contactEmail: "jane@newcorp.com",
          contactPhone: "9999999999",
          industry: "Finance",
          entityType: "Private Limited",
        },
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.id);
      assert.ok(res.body.id.startsWith("cli_"));
      assert.ok(res.body.credentials);
      assert.equal(res.body.credentials.email, "jane@newcorp.com");
      assert.ok(res.body.credentials.password, "Expected auto-generated password");
    });

    test("skips user creation when email already exists", async () => {
      mockDB.responseQueue.push([[{ id: "existing_user" }]]); // user exists
      mockDB.responseQueue.push({}); // INSERT Client
      mockDB.responseQueue.push({}); // INSERT Activity

      const res = await request(app, {
        method: "POST",
        path: "/api/admin/clients",
        headers: authHeader(adminToken),
        body: {
          companyName: "Corp",
          contactName: "John",
          contactEmail: "existing@test.com",
        },
      });

      assert.equal(res.status, 200);
      const userInserts = mockDB.queries.filter(
        (q) => q.sql.includes("INSERT INTO") && q.sql.includes("`User`")
      );
      assert.equal(userInserts.length, 0, "Should not insert user when email already exists");
    });
  });

  // ─── PATCH /clients/:id ───────────────────────────────────────────

  describe("PATCH /clients/:id", () => {
    test("updates client fields and touches updatedAt", async () => {
      mockDB.responseQueue.push({}); // UPDATE Client

      const res = await request(app, {
        method: "PATCH",
        path: "/api/admin/clients/cli_001",
        headers: authHeader(adminToken),
        body: {
          companyName: "Updated Corp",
          status: "INACTIVE",
        },
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      const updateCall = mockDB.queries.find(
        (q) => q.sql.includes("UPDATE") && q.sql.includes("Client")
      );
      assert.ok(updateCall, "Expected an UPDATE query");
      assert.ok(updateCall.params.includes("cli_001"), "Expected client ID in params");
      assert.ok(updateCall.sql.includes("updatedAt"), "Expected updatedAt to be set");
    });
  });

  // ─── DELETE /clients/:id ──────────────────────────────────────────

  describe("DELETE /clients/:id", () => {
    test("deletes a client by ID", async () => {
      mockDB.responseQueue.push({}); // DELETE

      const res = await request(app, {
        method: "DELETE",
        path: "/api/admin/clients/cli_001",
        headers: authHeader(adminToken),
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      const deleteCall = mockDB.queries.find(
        (q) => q.sql.includes("DELETE") && q.sql.includes("Client")
      );
      assert.ok(deleteCall);
      assert.ok(deleteCall.params.includes("cli_001"));
    });
  });

  // ─── GET /clients/:id ─────────────────────────────────────────────

  describe("GET /clients/:id", () => {
    test("returns 404 when client not found", async () => {
      mockDB.responseQueue.push([[]]); // no client

      const res = await request(app, {
        path: "/api/admin/clients/cli_nonexistent",
        headers: authHeader(adminToken),
      });
      assertError(res, 404);
    });

    test("returns full client detail with related data", async () => {
      mockDB.responseQueue.push([[{
        id: "cli_001",
        companyName: "Acme",
        notes: '{"allowedServices":["gst","compliance"]}',
      }]]);
      mockDB.responseQueue.push([[{ id: "ent_001", name: "Acme Ltd" }]]);  // entities
      mockDB.responseQueue.push([[]]);  // service requests
      mockDB.responseQueue.push([[]]);  // invoices
      mockDB.responseQueue.push([[]]);  // tickets
      mockDB.responseQueue.push([[]]);  // members
      mockDB.responseQueue.push([[]]);  // documents

      const res = await request(app, {
        path: "/api/admin/clients/cli_001",
        headers: authHeader(adminToken),
      });

      assert.equal(res.status, 200);
      assert.ok(res.body.client);
      assert.equal(res.body.client.companyName, "Acme");
      assert.ok(Array.isArray(res.body.entities));
      assert.ok(Array.isArray(res.body.serviceRequests));
      assert.ok(Array.isArray(res.body.invoices));
      assert.deepEqual(res.body.allowedServices, ["gst", "compliance"]);
    });
  });

  // ─── GET /tasks ───────────────────────────────────────────────────

  describe("GET /tasks", () => {
    test("returns paginated tasks with metadata", async () => {
      mockDB.responseQueue.push([[{ total: 25 }]]);  // COUNT
      mockDB.responseQueue.push([[                    // tasks list
        { id: "task_001", title: "File GST", priority: "HIGH", status: "IN_PROGRESS" },
        { id: "task_002", title: "Draft MOA", priority: "CRITICAL", status: "OPEN" },
      ]]);

      const res = await request(app, {
        path: "/api/admin/tasks?page=1&limit=20",
        headers: authHeader(adminToken),
      });

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.tasks));
      assert.equal(res.body.tasks.length, 2);
      assert.equal(res.body.total, 25);
      assert.equal(res.body.page, 1);
      assert.equal(res.body.pages, 2); // ceil(25/20)
    });

    test("supports filtering by status", async () => {
      mockDB.responseQueue.push([[{ total: 3 }]]);
      mockDB.responseQueue.push([[{ id: "t1" }, { id: "t2" }, { id: "t3" }]]);

      await request(app, {
        path: "/api/admin/tasks?status=OPEN",
        headers: authHeader(adminToken),
      });

      const countCall = mockDB.queries.find((q) => q.sql.includes("COUNT(*)"));
      assert.ok(countCall);
      assert.ok(countCall.sql.includes("t.status = ?"), "Expected status filter in query");
      assert.ok(countCall.params.includes("OPEN"));
    });

    test("supports priority filter", async () => {
      mockDB.responseQueue.push([[{ total: 1 }]]);
      mockDB.responseQueue.push([[{ id: "t1" }]]);

      await request(app, {
        path: "/api/admin/tasks?priority=CRITICAL",
        headers: authHeader(adminToken),
      });

      const countCall = mockDB.queries.find((q) => q.sql.includes("COUNT(*)"));
      assert.ok(countCall?.sql.includes("t.priority = ?"));
      assert.ok(countCall?.params.includes("CRITICAL"));
    });

    test("supports search filter", async () => {
      mockDB.responseQueue.push([[{ total: 1 }]]);
      mockDB.responseQueue.push([[{ id: "t1", title: "GST Filing" }]]);

      await request(app, {
        path: "/api/admin/tasks?search=GST",
        headers: authHeader(adminToken),
      });

      const countCall = mockDB.queries.find((q) => q.sql.includes("COUNT(*)"));
      assert.ok(countCall?.sql.includes("LIKE"));
      assert.ok(countCall?.params.includes("%GST%"));
    });
  });

  // ─── POST /tasks ──────────────────────────────────────────────────

  describe("POST /tasks", () => {
    test("returns 400 when title is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/admin/tasks",
        headers: authHeader(adminToken),
        body: { description: "Do something" },
      });
      assertError(res, 400);
    });

    test("creates a task successfully", async () => {
      mockDB.responseQueue.push({}); // INSERT task

      const res = await request(app, {
        method: "POST",
        path: "/api/admin/tasks",
        headers: authHeader(adminToken),
        body: {
          title: "File GSTR-1",
          description: "Monthly GST return",
          priority: "HIGH",
          clientId: "cli_001",
          assigneeId: "usr_admin",
        },
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.id);
      assert.ok(res.body.id.startsWith("task_"));
    });
  });

  // ─── Security headers ─────────────────────────────────────────────

  describe("Security headers", () => {
    test("admin endpoints set no-cache headers", async () => {
      // Enqueue enough responses for the stats endpoint
      for (let i = 0; i < 9; i++) mockDB.responseQueue.push(i < 7 ? [[{ count: 0 }]] : [[]]);

      const res = await request(app, {
        path: "/api/admin/stats",
        headers: authHeader(adminToken),
      });

      const cc = res.headers["cache-control"] || "";
      assert.ok(cc.includes("no-store"), `Expected no-store in Cache-Control: ${cc}`);
    });
  });
});
