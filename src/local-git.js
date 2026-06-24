import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { parseRepoSlug } from "./github.js";

const execFileAsync = promisify(execFile);

export async function detectGitRemoteSlug(cwd) {
  try {
    const { stdout } = await execFileAsync("git", ["config", "--get", "remote.origin.url"], {
      cwd
    });
    return parseGitRemote(stdout.trim());
  } catch {
    return null;
  }
}

export function parseGitRemote(remote) {
  if (!remote) {
    return null;
  }
  const parsed = parseRepoSlug(remote);
  return `${parsed.owner}/${parsed.repo}`;
}
