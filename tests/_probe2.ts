import "./helpers/register.js";
import { withPlatformConnection } from "../server/db.js";

const result = await withPlatformConnection(async (conn: any) => {
  return await conn.query("SELECT 1");
});

console.log("Mock DB result:", result);
process.exit(0);
