import assert from "node:assert/strict";
import test from "node:test";
import { allowRequest, resetLimits } from "./rate-limit.ts";

test("corta al pasar el cupo", () => {
  resetLimits();
  assert.equal(allowRequest("k", 2, 1000, 0), true);
  assert.equal(allowRequest("k", 2, 1000, 10), true);
  assert.equal(allowRequest("k", 2, 1000, 20), false);
  assert.equal(allowRequest("k", 2, 1000, 2000), true);
});
