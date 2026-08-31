/**
 * Registers the ESM loader hook for DB mocking.
 * Run tests with:  tsx --import ./tests/helpers/register.ts --test tests/auth.test.ts
 */
import { register } from "node:module";

// new URL().href gives a file:// URL that register() expects directly
const loaderUrl = new URL("./db-loader.mjs", import.meta.url).href;
register(loaderUrl);
