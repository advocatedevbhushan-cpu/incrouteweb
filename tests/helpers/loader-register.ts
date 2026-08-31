/**
 * ESM loader hook that intercepts imports of the db module and redirects
 * to our in-memory mock.  Used with:
 *   tsx --import ./tests/helpers/loader-register.ts --test tests/auth.test.ts
 *
 * OR simply:
 *   tsx --test tests/auth.test.ts
 * (if the setup script is imported first by each test file)
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Register the loader hook relative to this file
register("./tests/helpers/loader-hooks.js", pathToFileURL(import.meta.url));
