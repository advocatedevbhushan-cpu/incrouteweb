import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config();

// Build DATABASE_URL programmatically to avoid URL-encoding issues with special chars in password
const dbUser = process.env.DB_PRISMA_USER || "u453824837_Incroute_Admin";
const dbPass = process.env.DB_PRISMA_PASSWORD || process.env.DB_PASSWORD || "";
const dbHost = process.env.DB_PRISMA_HOST || process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PRISMA_PORT || "3306";
const dbName = process.env.DB_PRISMA_NAME || "u453824837_Platform";

// URL-encode the password properly (handles @, #, %, etc.)
const encodedPass = encodeURIComponent(dbPass);
const databaseUrl = process.env.DATABASE_URL || `mysql://${dbUser}:${encodedPass}@${dbHost}:${dbPort}/${dbName}`;

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: databaseUrl,
  },
  migrate: {
    url: databaseUrl,
  },
});
