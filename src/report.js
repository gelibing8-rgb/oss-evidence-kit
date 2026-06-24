export function buildMarkdownReport(evidence, options = {}) {
  const repo = evidence.repository;
  const score = evaluateEvidence(evidence);
  const title = options.title ?? `Open Source Evidence Report: ${repo.fullName}`;

  return [
    `# ${title}`,
    "",
    `Generated at: ${formatDateTime(evidence.collectedAt)}`,
    "",
    "> This report summarizes public GitHub evidence. It is not an official score, endorsement, or guarantee of approval for any grant, credit, or maintainer-support program.",
    "",
    "## Repository",
    "",
    table([
      ["Field", "Value"],
      ["Repository", link(repo.fullName, repo.url)],
      ["Description", safe(repo.description)],
      ["Homepage", repo.homepage ? link(repo.homepage, repo.homepage) : "Not set"],
      ["Visibility", safe(repo.visibility)],
      ["License", safe(repo.license)],
      ["Default branch", safe(repo.defaultBranch)],
      ["Topics", repo.topics.length ? repo.topics.map(code).join(", ") : "Not set"],
      ["Created", formatDate(repo.createdAt)],
      ["Last pushed", formatDate(repo.pushedAt)]
    ]),
    "",
    "## Public Signals",
    "",
    table([
      ["Signal", "Value"],
      ["Stars", number(repo.stars)],
      ["Forks", number(repo.forks)],
      ["Watchers", number(repo.watchers)],
      ["Open issues", number(repo.openIssues)],
      ["Sampled issues", `${number(evidence.issues.sampled)} (${number(evidence.issues.closed)} closed)`],
      ["Sampled pull requests", `${number(evidence.pullRequests.sampled)} (${number(evidence.pullRequests.closed)} closed)`],
      ["Contributors", number(evidence.contributors.length)],
      ["Community health", evidence.community.healthPercentage === null ? "Unavailable" : `${evidence.community.healthPercentage}%`]
    ]),
    "",
    "## Readiness Snapshot",
    "",
    `Overall readiness: **${score.label}** (${score.points}/${score.maxPoints})`,
    "",
    ...score.items.map((item) => `- ${item.ok ? "[x]" : "[ ]"} ${item.label}: ${item.note}`),
    "",
    "## Recent Releases",
    "",
    releaseList(evidence.releases),
    "",
    "## Recent Issues",
    "",
    itemList(evidence.issues.recent),
    "",
    "## Recent Pull Requests",
    "",
    itemList(evidence.pullRequests.recent),
    "",
    "## Top Contributors",
    "",
    contributorList(evidence.contributors),
    "",
    "## Recommended Next Evidence",
    "",
    "- Keep releases small, regular, and linked to closed issues.",
    "- Add screenshots, demo links, and use-case examples that outside maintainers can verify.",
    "- Invite real users to open issues or discussions; do not buy, trade, or fabricate stars.",
    "- Keep security, privacy, contribution, and governance boundaries explicit.",
    ""
  ].join("\n");
}

export function evaluateEvidence(evidence) {
  const repo = evidence.repository;
  const items = [
    {
      key: "public",
      label: "Public repository",
      ok: repo.visibility === "public",
      note: repo.visibility === "public" ? "publicly reviewable" : `visibility is ${repo.visibility}`
    },
    {
      key: "license",
      label: "Open-source license",
      ok: Boolean(repo.license),
      note: repo.license ? `${repo.license} detected` : "license not detected"
    },
    {
      key: "recent",
      label: "Recent maintenance",
      ok: daysSince(repo.pushedAt) <= 90,
      note: `${daysSince(repo.pushedAt)} days since last push`
    },
    {
      key: "release",
      label: "Release history",
      ok: evidence.releases.some((release) => !release.draft),
      note: evidence.releases.length ? `${evidence.releases.length} sampled releases` : "no public releases sampled"
    },
    {
      key: "activity",
      label: "Issue or PR activity",
      ok: evidence.issues.sampled + evidence.pullRequests.sampled > 0,
      note: `${evidence.issues.sampled} issues and ${evidence.pullRequests.sampled} pull requests sampled`
    },
    {
      key: "adoption",
      label: "External adoption signal",
      ok: repo.stars >= 25 || repo.forks >= 5,
      note: `${repo.stars} stars and ${repo.forks} forks`
    }
  ];

  const points = items.filter((item) => item.ok).length * 10;
  const maxPoints = items.length * 10;
  let label = "Early";
  const adoptionReady = items.find((item) => item.key === "adoption")?.ok;
  if (points >= 50 && adoptionReady) {
    label = "Strong";
  } else if (points >= 30) {
    label = "Developing";
  }

  return { points, maxPoints, label, items };
}

function releaseList(releases) {
  if (!releases.length) {
    return "No public releases sampled.";
  }
  return releases.map((release) => {
    const flags = [
      release.draft ? "draft" : null,
      release.prerelease ? "prerelease" : null
    ].filter(Boolean);
    return `- ${link(release.name, release.url)} (${code(release.tag)}, ${formatDate(release.publishedAt)}${flags.length ? `, ${flags.join(", ")}` : ""})`;
  }).join("\n");
}

function itemList(items) {
  if (!items.length) {
    return "No sampled items.";
  }
  return items.map((item) => `- #${item.number} ${link(item.title, item.url)} (${item.state}, updated ${formatDate(item.updatedAt)})`).join("\n");
}

function contributorList(contributors) {
  if (!contributors.length) {
    return "No contributor data sampled.";
  }
  return contributors.map((person) => `- ${link(person.login, person.url)}: ${number(person.contributions)} contributions`).join("\n");
}

function table(rows) {
  const [header, ...body] = rows;
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n");
}

function safe(value) {
  return String(value ?? "Not set").replace(/\|/g, "\\|");
}

function link(label, url) {
  return `[${safe(label)}](${url})`;
}

function code(value) {
  return `\`${safe(value)}\``;
}

function number(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatDate(value) {
  if (!value) {
    return "Not set";
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function formatDateTime(value) {
  const date = new Date(value);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${formatDate(value)} ${hours}:${minutes} UTC`;
}

function daysSince(value) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }
  const diff = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}
