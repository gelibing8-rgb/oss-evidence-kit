import test from "node:test";
import assert from "node:assert/strict";

import { parseRepoSlug, toRepositoryUrl } from "../src/github.js";

test("parseRepoSlug accepts owner/name", () => {
  assert.deepEqual(parseRepoSlug("openai/openai-node"), {
    owner: "openai",
    repo: "openai-node"
  });
});

test("parseRepoSlug accepts GitHub HTTPS URL", () => {
  assert.deepEqual(parseRepoSlug("https://github.com/openai/openai-node.git"), {
    owner: "openai",
    repo: "openai-node"
  });
});

test("parseRepoSlug accepts GitHub SSH URL", () => {
  assert.deepEqual(parseRepoSlug("git@github.com:openai/openai-node.git"), {
    owner: "openai",
    repo: "openai-node"
  });
});

test("toRepositoryUrl normalizes a slug", () => {
  assert.equal(toRepositoryUrl("openai/openai-node"), "https://github.com/openai/openai-node");
});
