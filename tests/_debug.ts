import "./helpers/register.js";
import { mockDB, resetMockDB } from "./helpers/mock-db-module.js";
import { createServicesRouter } from "../server/routes/services.js";
import { createTestApp, request } from "./helpers/setup.js";

process.env.SMTP_USER = "test@incroute.com";
process.env.NOTIFICATION_TO = "admin@incroute.com";

const mockTransporter = { sendMail: async () => ({}) };
const router = createServicesRouter([], mockTransporter);
const app = createTestApp(router);

// Check catalog
const res1 = await request(app, { path: "/api/services-catalog" });
console.log("catalog status:", res1.status);
console.log("catalog body keys:", Object.keys(res1.body));
console.log("catalog data type:", typeof res1.body.data);
if (res1.body.data) console.log("catalog data is array:", Array.isArray(res1.body.data));

// Check lead params
resetMockDB();
const mockTransporter2 = { sendMail: async () => ({}) };
const router2 = createServicesRouter([], mockTransporter2);
const app2 = createTestApp(router2);
await request(app2, {
  method: "POST",
  path: "/api/leads",
  body: { phone: "9876543210" },
});
const leadInserts = mockDB.queries.filter(
  (q) => q.sql.includes("INSERT INTO") && q.sql.includes("Submission")
);
console.log("\nlead insert SQL:", leadInserts[0]?.sql);
console.log("lead insert params:", leadInserts[0]?.params);
process.exit(0);
