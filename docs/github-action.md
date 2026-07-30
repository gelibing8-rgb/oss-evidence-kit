# GitHub Action Usage

This guide shows how to regenerate `docs/reviewer-evidence.md` from GitHub Actions.

The workflow is intentionally manual by default. Evidence reports should be reviewed before being committed because public signals can change and the report may be used in applications, sponsorship pages, or maintainer updates.

## Minimal workflow

Create `.github/workflows/evidence-report.yml` in the repository you want to report on:

```yaml
name: Evidence Report

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Generate report
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx oss-evidence-kit report --repo ${{ github.repository }} --out docs/reviewer-evidence.md

      - name: Commit report if changed
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: Refresh reviewer evidence
          file_pattern: docs/reviewer-evidence.md
```

## Token permissions

The CLI only needs read access to public repository metadata. The workflow needs `contents: write` only because it commits the regenerated Markdown file back to the repository.

If you do not want the workflow to commit automatically, use `contents: read` and upload the report as an artifact instead.

## Review boundary

Do not treat the generated report as an official score. It is a public evidence summary. Keep claims about stars, forks, users, sponsors, and program eligibility tied to verifiable sources.
