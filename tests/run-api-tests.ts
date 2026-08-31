#!/usr/bin/env tsx
/**
 * Test runner that sets up the mock DB, then runs the API route tests.
 *
 * This approach: temporarily symlink server/db.ts → mock before tests,
 * then restore after.  Works with any module system.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const dbPath = path.join(projectRoot, "server", "db.ts");
const dbBackup = path.join(projectRoot, "server", "db.ts.bak");
const mockPath = path.join(projectRoot, "tests", "helpers", "mock-db-module.ts");

// Check if backup already exists (from a crashed run)
if (fs.existsSync(dbBackup)) {
  fs.copyFileSync(dbBackup, dbPath);
  fs.unlinkSync(dbBackup);
}

// Backup the real db.ts
fs.copyFileSync(dbPath, dbBackup);

// Replace with mock
fs.copyFileSync(mockPath, dbPath);

const testFiles = [
  "tests/auth.test.ts",
  "tests/services.test.ts",
  "tests/admin.test.ts",
];

let exitCode = 0;

try {
  const cmd = `npx tsx --test ${testFiles.join(" ")}`;
  console.log(`\n🧪 Running: ${cmd}\n`);
  execSync(cmd, { cwd: projectRoot, stdio: "inherit" });
} catch (err: any) {
  exitCode = err.status || 1;
} finally {
  // Always restore the original db.ts
  if (fs.existsSync(dbBackup)) {
    fs.copyFileSync(dbBackup, dbPath);
    fs.unlinkSync(dbBackup);
    console.log("\n✅ Restored server/db.ts");
  }
}

process.exit(exitCode);
