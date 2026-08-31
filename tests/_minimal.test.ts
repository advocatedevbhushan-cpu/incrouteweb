import "./helpers/register.js";
import test from "node:test";
import assert from "node:assert/strict";

test("minimal test passes", async () => {
  assert.equal(1 + 1, 2);
});
