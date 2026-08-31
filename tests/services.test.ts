/**
 * API route tests for /api/* services endpoints.
 *
 * Covers: /contact, /leads, /apply, /send-premium-request, /services-catalog,
 * /compliance/calendar
 *
 * Run: tsx --import ./tests/helpers/register.ts --test tests/services.test.ts
 */
import "./helpers/register.js";

import test, { describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mockDB, resetMockDB } from "./helpers/mock-db-module.js";
import { createServicesRouter } from "../server/routes/services.js";
import {
  createTestApp,
  request,
  assertError,
} from "./helpers/setup.js";

// Mock compliance calendar data
const testCalendar = [
  { id: "1", service: "GST Filing", description: "Monthly filings", dueDate: "11th", type: "taxation" },
  { id: "2", service: "ROC Filing", description: "Annual return", dueDate: "30 days after AGM", type: "corporate" },
];

// Mock email transporter that records calls
const mockTransporter = {
  sendMail: async (opts: any) => {
    mockTransporter.calls.push(opts);
    return { messageId: "test-msg-id" };
  },
  calls: [] as any[],
  reset() {
    this.calls = [];
  },
};

process.env.SMTP_USER = "test@incroute.com";
process.env.NOTIFICATION_TO = "admin@incroute.com";

const router = createServicesRouter(testCalendar, mockTransporter);
const app = createTestApp(router);

describe("Services routes", () => {
  afterEach(() => {
    resetMockDB();
    mockTransporter.reset();
  });

  // ─── GET /compliance/calendar ──────────────────────────────────────

  describe("GET /compliance/calendar", () => {
    test("returns the compliance calendar", async () => {
      const res = await request(app, { path: "/api/compliance/calendar" });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.count, 2);
      assert.equal(res.body.calendar.length, 2);
      assert.equal(res.body.calendar[0].service, "GST Filing");
    });

    test("also responds to /compliance-calendar", async () => {
      const res = await request(app, { path: "/api/compliance-calendar" });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });

  // ─── GET /services-catalog ─────────────────────────────────────────

  describe("GET /services-catalog", () => {
    test("returns 200 with catalog data or empty array", async () => {
      const res = await request(app, { path: "/api/services-catalog" });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });
  });

  // ─── POST /contact ─────────────────────────────────────────────────

  describe("POST /contact", () => {
    test("returns 400 when name is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/contact",
        body: { email: "test@example.com", message: "Hello" },
      });
      assertError(res, 400);
    });

    test("returns 400 when email is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/contact",
        body: { name: "John", message: "Hello" },
      });
      assertError(res, 400);
    });

    test("returns 400 when message is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/contact",
        body: { name: "John", email: "test@example.com" },
      });
      assertError(res, 400);
    });

    test("returns 201 on successful contact submission", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/contact",
        body: {
          name: "Jane Doe",
          email: "jane@example.com",
          phone: "9876543210",
          service: "Private Limited Registration",
          message: "I need help incorporating a company.",
        },
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.submissionId);
      assert.ok(res.body.submissionId.startsWith("sub_"));
    });

    test("stores submission in database", async () => {
      await request(app, {
        method: "POST",
        path: "/api/contact",
        body: { name: "Test", email: "test@test.com", message: "msg" },
      });

      const insertCalls = mockDB.queries.filter(
        (q) => q.sql.includes("INSERT INTO") && q.sql.includes("Submission")
      );
      assert.ok(insertCalls.length > 0, "Expected INSERT into Submission table");
    });

    test("sends admin lead notification email", async () => {
      await request(app, {
        method: "POST",
        path: "/api/contact",
        body: { name: "Jane", email: "jane@test.com", message: "Test" },
      });

      assert.ok(mockTransporter.calls.length > 0, "Expected at least one email to be sent");
      // First email should be the admin notification
      const adminEmail = mockTransporter.calls[0];
      assert.ok(adminEmail.subject.includes("Contact Lead"));
      assert.equal(adminEmail.to, "admin@incroute.com");
    });

    test("sends client confirmation email", async () => {
      await request(app, {
        method: "POST",
        path: "/api/contact",
        body: { name: "Jane", email: "jane@test.com", message: "Test" },
      });

      // Second email should be the client confirmation
      assert.ok(mockTransporter.calls.length >= 2, "Expected at least 2 emails");
      const clientEmail = mockTransporter.calls[1];
      assert.equal(clientEmail.to, "jane@test.com");
    });
  });

  // ─── POST /leads ───────────────────────────────────────────────────

  describe("POST /leads", () => {
    test("returns 400 when phone is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/leads",
        body: { name: "Test" },
      });
      assertError(res, 400);
      assert.ok(res.body.error.includes("Phone"));
    });

    test("returns 201 on successful lead submission", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/leads",
        body: {
          name: "Founder",
          phone: "9876543210",
          entityType: "Private Limited",
          email: "founder@startup.com",
          source: "Website",
        },
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.leadId);
      assert.ok(res.body.leadId.startsWith("lead_"));
    });

    test("stores lead in database with formType 'lead'", async () => {
      await request(app, {
        method: "POST",
        path: "/api/leads",
        body: { phone: "9876543210" },
      });

      const insertCalls = mockDB.queries.filter(
        (q) => q.sql.includes("INSERT INTO") && q.sql.includes("Submission")
      );
      assert.ok(insertCalls.length > 0);
      // Verify formType is 'lead'
      assert.ok(insertCalls[0].params.includes("lead"));
    });

    test("sends admin notification for leads", async () => {
      await request(app, {
        method: "POST",
        path: "/api/leads",
        body: { phone: "9876543210", name: "Founder" },
      });

      assert.ok(mockTransporter.calls.length > 0);
      assert.ok(mockTransporter.calls[0].subject.includes("Lead"));
    });

    test("sends client email when email is provided", async () => {
      await request(app, {
        method: "POST",
        path: "/api/leads",
        body: { phone: "9876543210", email: "founder@test.com" },
      });

      // Admin + client emails
      assert.ok(mockTransporter.calls.length >= 2);
      assert.equal(mockTransporter.calls[1].to, "founder@test.com");
    });

    test("does not send client email when no email provided", async () => {
      await request(app, {
        method: "POST",
        path: "/api/leads",
        body: { phone: "9876543210" },
      });

      // Only admin email
      assert.equal(mockTransporter.calls.length, 1);
    });
  });

  // ─── POST /apply ───────────────────────────────────────────────────

  describe("POST /apply", () => {
    test("returns 400 when name is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/apply",
        body: { email: "a@b.com", phone: "123" },
      });
      assertError(res, 400);
    });

    test("returns 400 when email is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/apply",
        body: { name: "John", phone: "123" },
      });
      assertError(res, 400);
    });

    test("returns 400 when phone is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/apply",
        body: { name: "John", email: "a@b.com" },
      });
      assertError(res, 400);
    });

    test("returns 201 on successful application", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/apply",
        body: {
          name: "Applicant",
          email: "applicant@test.com",
          phone: "9876543210",
          position: "Legal Associate",
          details: "I have 3 years of experience.",
        },
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.applicationId);
      assert.ok(res.body.applicationId.startsWith("app_"));
    });

    test("stores application with correct formType", async () => {
      await request(app, {
        method: "POST",
        path: "/api/apply",
        body: { name: "App", email: "app@test.com", phone: "123" },
      });

      const insertCalls = mockDB.queries.filter(
        (q) => q.sql.includes("INSERT INTO") && q.sql.includes("Submission")
      );
      assert.ok(insertCalls.length > 0);
      assert.ok(insertCalls[0].params.includes("career_application"));
    });

    test("sends admin notification for career applications", async () => {
      await request(app, {
        method: "POST",
        path: "/api/apply",
        body: { name: "App", email: "app@test.com", phone: "123", position: "Developer" },
      });

      assert.ok(mockTransporter.calls.length > 0);
      assert.ok(mockTransporter.calls[0].subject.includes("Career Application"));
    });

    test("sends candidate acknowledgment email", async () => {
      await request(app, {
        method: "POST",
        path: "/api/apply",
        body: { name: "App", email: "app@test.com", phone: "123" },
      });

      assert.ok(mockTransporter.calls.length >= 2);
      assert.equal(mockTransporter.calls[1].to, "app@test.com");
    });
  });

  // ─── POST /send-premium-request ────────────────────────────────────

  describe("POST /send-premium-request", () => {
    test("returns 400 when email is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/send-premium-request",
        body: { phone: "123" },
      });
      assertError(res, 400);
    });

    test("returns 400 when phone is missing", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/send-premium-request",
        body: { email: "a@b.com" },
      });
      assertError(res, 400);
    });

    test("returns 200 on successful premium request", async () => {
      const res = await request(app, {
        method: "POST",
        path: "/api/send-premium-request",
        body: {
          fullName: "Enterprise Client",
          email: "enterprise@corp.com",
          phone: "9876543210",
          companyName: "Acme Corp",
          notes: "Need custom MOA drafting",
        },
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.requestId);
      assert.ok(res.body.requestId.startsWith("PREM-"));
    });

    test("stores request with formType 'premium_request'", async () => {
      await request(app, {
        method: "POST",
        path: "/api/send-premium-request",
        body: { email: "e@corp.com", phone: "123" },
      });

      const insertCalls = mockDB.queries.filter(
        (q) => q.sql.includes("INSERT INTO") && q.sql.includes("Submission")
      );
      assert.ok(insertCalls.length > 0);
      assert.ok(insertCalls[0].params.includes("premium_request"));
    });

    test("sends admin notification for premium requests", async () => {
      await request(app, {
        method: "POST",
        path: "/api/send-premium-request",
        body: { email: "e@corp.com", phone: "123", companyName: "Corp" },
      });

      assert.ok(mockTransporter.calls.length > 0);
      assert.ok(mockTransporter.calls[0].subject.includes("Drafting"));
    });

    test("sends client confirmation email", async () => {
      await request(app, {
        method: "POST",
        path: "/api/send-premium-request",
        body: { email: "client@test.com", phone: "123", fullName: "Client" },
      });

      assert.ok(mockTransporter.calls.length >= 2);
      assert.equal(mockTransporter.calls[1].to, "client@test.com");
    });
  });
});
