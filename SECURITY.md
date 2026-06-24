# Security

OSS Evidence Kit reads public GitHub repository metadata by default.

## Supported versions

The latest release receives security fixes.

## Reporting a vulnerability

Open a private security advisory on GitHub, or email the maintainer if a public issue would expose sensitive details.

## Token handling

The CLI can use `GITHUB_TOKEN` to increase GitHub API rate limits. Tokens are read from the environment and are not written to generated reports.

Do not paste tokens into issue reports, examples, command output, screenshots, or committed files.
