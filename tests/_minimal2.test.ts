import "./helpers/register.js";
import test from "node:test";
import assert from "node:assert/strict";
import { mockDB, resetMockDB } from "./helpers/mock-db-module.js";

process.env.JWT_SECRET = "test";

test("import auth router", async () => {
  const { createAuthRouter } = await import("../server/routes/auth.js");
  const router = createAuthRouter();
  assert.ok(router);
  console.log("Auth router created successfully");

  // Clear the setInterval to allow process to exit
  // @ts-ignore
  for (const entry of router.stack || []) {
    if (entry.handle && entry.handle._idleTimeout !== undefined) {
      clearTimeout(entry.handle);
    }
  }
});
