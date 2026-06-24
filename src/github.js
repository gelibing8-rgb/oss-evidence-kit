const API_ROOT = "https://api.github.com";

export function parseRepoSlug(input) {
  if (typeof input === "object" && input?.owner && input?.repo) {
    return {
      owner: cleanSegment(input.owner),
      repo: cleanSegment(input.repo)
    };
  }

  const raw = String(input ?? "").trim();
  if (!raw) {
    throw new Error("Repository value is empty.");
  }

  const httpsMatch = raw.match(/^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+)(?:[/?#].*)?$/i);
  const sshMatch = raw.match(/^git@github\.com:([^/\s]+)\/([^/\s#?]+?)(?:\.git)?$/i);
  const slugMatch = raw.match(/^([^/\s]+)\/([^/\s#?]+)$/);

  const match = httpsMatch ?? sshMatch ?? slugMatch;
  if (!match) {
    throw new Error(`Cannot parse GitHub repository: ${raw}`);
  }

  return {
    owner: cleanSegment(match[1]),
    repo: cleanSegment(match[2].replace(/\.git$/i, ""))
  };
}

export function toRepositoryUrl(repo) {
  const parsed = parseRepoSlug(repo);
  return `https://github.com/${parsed.owner}/${parsed.repo}`;
}

export async function fetchRepositoryEvidence(repoInput, options = {}) {
  const repo = parseRepoSlug(repoInput);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new Error("No fetch implementation is available.");
  }

  const request = (path, requestOptions = {}) => fetchJson(path, {
    ...requestOptions,
    fetchImpl,
    token: options.token ?? process.env.GITHUB_TOKEN
  });

  const [repository, releases, issues, contributors, community] = await Promise.all([
    request(`/repos/${repo.owner}/${repo.repo}`),
    request(`/repos/${repo.owner}/${repo.repo}/releases?per_page=5`, { optional: true, fallback: [] }),
    request(`/repos/${repo.owner}/${repo.repo}/issues?state=all&per_page=50`, { optional: true, fallback: [] }),
    request(`/repos/${repo.owner}/${repo.repo}/contributors?per_page=10`, { optional: true, fallback: [] }),
    request(`/repos/${repo.owner}/${repo.repo}/community/profile`, { optional: true, fallback: null })
  ]);

  const pullRequests = issues.filter((item) => item.pull_request);
  const issueItems = issues.filter((item) => !item.pull_request);

  return {
    collectedAt: new Date().toISOString(),
    repository: normalizeRepository(repository),
    releases: releases.map(normalizeRelease),
    issues: summarizeIssues(issueItems),
    pullRequests: summarizeIssues(pullRequests),
    contributors: contributors.map(normalizeContributor),
    community: normalizeCommunity(community)
  };
}

async function fetchJson(path, options) {
  const url = `${API_ROOT}${path}`;
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": "oss-evidence-kit"
  };

  if (options.token) {
    headers.authorization = `Bearer ${options.token}`;
  }

  const response = await options.fetchImpl(url, { headers });
  if (!response.ok) {
    if (options.optional) {
      return options.fallback;
    }
    throw new Error(`GitHub API ${response.status} for ${path}`);
  }
  return response.json();
}

function normalizeRepository(repo) {
  return {
    fullName: repo.full_name,
    name: repo.name,
    owner: repo.owner?.login,
    url: repo.html_url,
    description: repo.description,
    homepage: repo.homepage,
    topics: repo.topics ?? [],
    visibility: repo.visibility ?? (repo.private ? "private" : "public"),
    license: repo.license?.spdx_id ?? null,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    watchers: repo.subscribers_count ?? repo.watchers_count ?? 0,
    openIssues: repo.open_issues_count ?? 0,
    defaultBranch: repo.default_branch,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at
  };
}

function normalizeRelease(release) {
  return {
    name: release.name || release.tag_name,
    tag: release.tag_name,
    url: release.html_url,
    draft: Boolean(release.draft),
    prerelease: Boolean(release.prerelease),
    publishedAt: release.published_at
  };
}

function normalizeContributor(contributor) {
  return {
    login: contributor.login,
    url: contributor.html_url,
    contributions: contributor.contributions ?? 0
  };
}

function summarizeIssues(items) {
  const open = items.filter((item) => item.state === "open").length;
  const closed = items.filter((item) => item.state === "closed").length;
  return {
    sampled: items.length,
    open,
    closed,
    recent: items.slice(0, 10).map((item) => ({
      number: item.number,
      title: item.title,
      state: item.state,
      url: item.html_url,
      updatedAt: item.updated_at
    }))
  };
}

function normalizeCommunity(community) {
  if (!community) {
    return {
      healthPercentage: null,
      files: {}
    };
  }

  const files = community.files ?? {};
  return {
    healthPercentage: community.health_percentage ?? null,
    files: {
      codeOfConduct: Boolean(files.code_of_conduct),
      contributing: Boolean(files.contributing),
      issueTemplate: Boolean(files.issue_template),
      pullRequestTemplate: Boolean(files.pull_request_template),
      license: Boolean(files.license),
      readme: Boolean(files.readme)
    }
  };
}

function cleanSegment(value) {
  const cleaned = String(value ?? "").trim();
  if (!cleaned || cleaned.includes("..")) {
    throw new Error("Invalid GitHub repository segment.");
  }
  return cleaned;
}
