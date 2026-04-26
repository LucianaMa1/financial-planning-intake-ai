import assert from "node:assert/strict";
import test from "node:test";

import {
  createClientProfile,
  initialQuestionnaire,
  getVisibleClientKeys,
} from "../src/lib/questionnaire.ts";

test("defaults to showing only client 1", () => {
  assert.deepEqual(getVisibleClientKeys(initialQuestionnaire), ["client1"]);
});

test("shows client 2 once any client 2 data exists", () => {
  const questionnaire = structuredClone(initialQuestionnaire);
  questionnaire.clients.client2.fullName = "Taylor Smith";

  assert.deepEqual(getVisibleClientKeys(questionnaire), ["client1", "client2"]);
});

test("treats whitespace-only client 2 fields as empty", () => {
  const questionnaire = structuredClone(initialQuestionnaire);
  questionnaire.clients.client2 = createClientProfile();
  questionnaire.clients.client2.email = "   ";

  assert.deepEqual(getVisibleClientKeys(questionnaire), ["client1"]);
});
