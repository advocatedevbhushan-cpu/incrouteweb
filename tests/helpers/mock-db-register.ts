/**
 * Sets up mock DB before routes are imported.
 *
 * Run with:  tsx --import ./tests/helpers/mock-db-register.ts tests/auth.test.ts
 *
 * This hooks into Node's module resolution so that any import of
 * "../../server/db" or "../db" resolves to our mock instead.
 */
import { register } from "node:module";

// Register a custom loader that intercepts db module imports
register("./tests/helpers/mock-db-loader.js", import.meta.url);
