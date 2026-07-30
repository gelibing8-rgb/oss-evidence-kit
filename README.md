# OSS Evidence Kit

[![CI](https://github.com/gelibing8-rgb/oss-evidence-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/gelibing8-rgb/oss-evidence-kit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-5ee6a8.svg)](package.json)

OSS Evidence Kit helps open-source maintainers generate a concise, verifiable public evidence report from a GitHub repository.

Live page: https://gelibing8-rgb.github.io/oss-evidence-kit/

It is built for maintainers who need to explain project activity, public usage signals, releases, issues, pull requests, community files, and maintenance readiness when applying for open-source support programs, grants, credits, sponsorships, or internal approvals.

It does not fake popularity, inflate stars, or guarantee acceptance by any program.

## Why this exists

Many open-source maintainers do real maintenance work, but the evidence is scattered across GitHub pages:

1. repository metadata;
2. releases;
3. closed issues;
4. pull requests;
5. contributors;
6. security and contribution files;
7. public demo and documentation links.

OSS Evidence Kit turns those public signals into a review-friendly Markdown report.

## Install

Run directly from the repository:

```bash
node bin/oss-evidence-kit.js report --repo owner/name --out docs/reviewer-evidence.md
```

After npm publication:

```bash
npx oss-evidence-kit report --repo owner/name --out docs/reviewer-evidence.md
```

## Usage

Generate a report for any public GitHub repository:

```bash
oss-evidence-kit report --repo openai/openai-node --out evidence.md
```

Generate machine-readable JSON:

```bash
oss-evidence-kit report --repo openai/openai-node --format json --out evidence.json
```

From inside a Git repository, omit `--repo` and the CLI will use `remote.origin.url`:

```bash
oss-evidence-kit report --out docs/reviewer-evidence.md
```

Use `GITHUB_TOKEN` to raise API rate limits:

```bash
GITHUB_TOKEN=ghp_xxx oss-evidence-kit report --repo owner/name
```

Do not commit tokens.

## Output

The generated report includes:

1. repository URL, license, visibility, topics, homepage, and default branch;
2. stars, forks, watchers, open issues, sampled issue/PR activity, and contributors;
3. recent releases;
4. recent issues and pull requests;
5. a simple readiness snapshot;
6. recommended next evidence.

Markdown is the default output format. Use `--format json` when a workflow, dashboard, or GitHub Action needs structured evidence.

See [example report](examples/sample-report.md).

## GitHub Action

Use the manual GitHub Action example to regenerate reviewer evidence from a repository workflow. See [GitHub Action usage](docs/github-action.md).

## Project Principles

1. Public evidence only by default.
2. Zero dependencies for easy review and low supply-chain risk.
3. No private repository scraping.
4. No star trading, buying, or fabricated adoption claims.
5. Reviewer-friendly output that can be checked quickly.

## OpenAI Codex for Open Source Alignment

OpenAI describes Codex for Open Source as support for maintainers of open-source projects that are widely used or important, with an application asking for the GitHub repository, maintainer role, and project importance.

This project helps maintainers prepare the public evidence behind that kind of application. See [Codex for OSS application notes](docs/codex-for-oss-application.md).

## Roadmap

See [roadmap](docs/roadmap.md).

## Contributing

Issues, examples, and small pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License.
