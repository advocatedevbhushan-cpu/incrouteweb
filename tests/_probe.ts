import "./helpers/register.js";
import { withPlatformConnection } from "../server/db.js";

console.log("typeof withPlatformConnection:", typeof withPlatformConnection);

// Test that the mock works
const result = await withPlatformConnection(async (conn: any) => {
  const r = await conn.query("SELECT 1 as test");
  return r;
});
console.log("mock query result:", result);
console.log("✅ Mock DB is working!");
