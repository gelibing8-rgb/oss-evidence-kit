import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { fetchRepositoryEvidence, parseRepoSlug } from "./github.js";
import { detectGitRemoteSlug } from "./local-git.js";
import { buildMarkdownReport } from "./report.js";

const HELP = `oss-evidence-kit

Usage:
  oss-evidence-kit report --repo owner/name --out docs/reviewer-evidence.md
  oss-evidence-kit report --repo https://github.com/owner/name
  oss-evidence-kit report --out docs/reviewer-evidence.md

Options:
  --repo <owner/name|url>  Public GitHub repository. Defaults to remote.origin.url.
  --out <path>            Write markdown report to this file. Defaults to stdout.
  --title <text>          Override report title.
  --help                  Show this help.
`;

export async function runCli(argv, options = {}) {
  const parsed = parseArgs(argv);

  if (parsed.help) {
    options.stdout?.write(HELP);
    return { ok: true };
  }

  if (parsed.command !== "report") {
    throw new Error("Expected command: report. Run with --help for usage.");
  }

  const repoInput = parsed.repo ?? await detectGitRemoteSlug(process.cwd());
  if (!repoInput) {
    throw new Error("No --repo value found and remote.origin.url is not set.");
  }

  const repo = parseRepoSlug(repoInput);
  const evidence = await fetchRepositoryEvidence(repo, {
    fetchImpl: options.fetchImpl,
    token: options.token
  });
  const markdown = buildMarkdownReport(evidence, {
    title: parsed.title
  });

  if (parsed.out) {
    const outputPath = resolve(parsed.out);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, markdown, "utf8");
    options.stdout?.write(`Wrote ${outputPath}\n`);
    return { ok: true, out: outputPath };
  }

  options.stdout?.write(markdown);
  return { ok: true };
}

export function parseArgs(argv) {
  const parsed = {
    command: argv[0],
    help: false,
    out: null,
    repo: null,
    title: null
  };

  if (!argv.length || argv.includes("--help") || argv.includes("-h")) {
    parsed.help = true;
    parsed.command = parsed.command ?? "report";
    return parsed;
  }

  for (let index = 1; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--repo") {
      parsed.repo = requireValue(argv, index, "--repo");
      index += 1;
    } else if (item === "--out") {
      parsed.out = requireValue(argv, index, "--out");
      index += 1;
    } else if (item === "--title") {
      parsed.title = requireValue(argv, index, "--title");
      index += 1;
    } else {
      throw new Error(`Unknown option: ${item}`);
    }
  }

  return parsed;
}

function requireValue(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value.`);
  }
  return value;
}
