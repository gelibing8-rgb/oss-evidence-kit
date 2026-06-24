import test from "node:test";
import assert from "node:assert/strict";

import { parseArgs } from "../src/cli.js";

test("parseArgs parses report options", () => {
  assert.deepEqual(parseArgs([
    "report",
    "--repo",
    "owner/project",
    "--out",
    "docs/report.md",
    "--title",
    "Custom"
  ]), {
    command: "report",
    help: false,
    out: "docs/report.md",
    repo: "owner/project",
    title: "Custom"
  });
});

test("parseArgs handles help", () => {
  const parsed = parseArgs(["--help"]);
  assert.equal(parsed.help, true);
});
