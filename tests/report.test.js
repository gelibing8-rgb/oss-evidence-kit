import test from "node:test";
import assert from "node:assert/strict";

import { buildJsonReport, buildMarkdownReport, evaluateEvidence } from "../src/report.js";

const sample = {
  collectedAt: "2026-06-24T00:00:00.000Z",
  repository: {
    fullName: "owner/project",
    name: "project",
    owner: "owner",
    url: "https://github.com/owner/project",
    description: "Useful project",
    homepage: "https://example.com",
    topics: ["oss", "maintainer"],
    visibility: "public",
    license: "MIT",
    stars: 42,
    forks: 6,
    watchers: 3,
    openIssues: 2,
    defaultBranch: "main",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
    pushedAt: new Date().toISOString()
  },
  releases: [
    {
      name: "v0.1.0",
      tag: "v0.1.0",
      url: "https://github.com/owner/project/releases/tag/v0.1.0",
      draft: false,
      prerelease: false,
      publishedAt: "2026-06-20T00:00:00.000Z"
    }
  ],
  issues: {
    sampled: 1,
    open: 0,
    closed: 1,
    recent: [
      {
        number: 1,
        title: "Add report example",
        state: "closed",
        url: "https://github.com/owner/project/issues/1",
        updatedAt: "2026-06-21T00:00:00.000Z"
      }
    ]
  },
  pullRequests: {
    sampled: 1,
    open: 0,
    closed: 1,
    recent: [
      {
        number: 2,
        title: "Add CLI",
        state: "closed",
        url: "https://github.com/owner/project/pull/2",
        updatedAt: "2026-06-22T00:00:00.000Z"
      }
    ]
  },
  contributors: [
    {
      login: "owner",
      url: "https://github.com/owner",
      contributions: 12
    }
  ],
  community: {
    healthPercentage: 80,
    files: {
      codeOfConduct: true,
      contributing: true,
      issueTemplate: true,
      pullRequestTemplate: false,
      license: true,
      readme: true
    }
  }
};

test("evaluateEvidence returns strong readiness for a maintained sample", () => {
  const result = evaluateEvidence(sample);
  assert.equal(result.label, "Strong");
  assert.equal(result.points, result.maxPoints);
});

test("buildMarkdownReport includes core public evidence", () => {
  const markdown = buildMarkdownReport(sample);
  assert.match(markdown, /Open Source Evidence Report: owner\/project/);
  assert.match(markdown, /Stars/);
  assert.match(markdown, /Recent Releases/);
  assert.match(markdown, /Recommended Next Evidence/);
});

test("buildJsonReport returns parseable evidence", () => {
  const parsed = JSON.parse(buildJsonReport(sample));
  assert.equal(parsed.repository.fullName, "owner/project");
  assert.equal(parsed.releases[0].tag, "v0.1.0");
});
