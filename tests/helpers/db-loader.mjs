/**
 * ESM loader hook: intercepts imports of server/db and redirects
 * to our in-memory mock module.
 *
 * This file MUST be .mjs (plain JS ESM) because Node loader hooks
 * cannot be TypeScript.
 */
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_DB_URL = pathToFileURL(path.join(__dirname, "mock-db-module.ts")).href;

export function resolve(specifier, context, nextResolve) {
  const parentURL = context.parentURL || "";

  // Match any import that resolves to server/db
  // Route files use: import { ... } from "../db"
  // This resolves to server/db relative to server/routes/

  let shouldIntercept = false;

  // Relative "../db" from route files
  if ((specifier === "../db" || specifier === "../db.js" || specifier === "../db.ts") &&
      parentURL.includes("/server/routes/")) {
    shouldIntercept = true;
  }

  // Absolute paths to server/db
  if (specifier.includes("server/db") && !specifier.includes("mock")) {
    shouldIntercept = true;
  }

  // Also catch any specifier that ends with /server/db
  if (/server\/db(\.ts|\.js)?$/.test(specifier) && !specifier.includes("mock")) {
    shouldIntercept = true;
  }

  if (shouldIntercept) {
    return { url: MOCK_DB_URL, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
