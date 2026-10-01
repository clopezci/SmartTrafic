import assert from "node:assert/strict";
import test from "node:test";
import { signBody, signaturesMatch } from "./hmac.ts";

test("la firma coincide y una distinta no", () => {
  const sig = signBody("cr-01", "secret");
  assert.equal(signaturesMatch(sig, sig), true);
  assert.equal(signaturesMatch(sig, "otra"), false);
  assert.equal(signaturesMatch(sig, null), false);
});
