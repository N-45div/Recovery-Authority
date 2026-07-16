import { readFile, realpath } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

export interface RuntimeIdentity {
  platform: NodeJS.Platform;
  uid: number | null;
  accountHome: string | null;
  accountHomeSource: "passwd" | "nss" | "bsd-id" | "windows-environment" | "unresolved";
  environmentHome: string | null;
  environmentHomeMatchesAccount: boolean | null;
  authorityDataRoot: string;
  warnings: string[];
}

function passwdHome(contents: string, uid: number): string | null {
  for (const line of contents.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const fields = line.split(":");
    if (Number(fields[2]) === uid && fields[5]) return fields[5];
  }
  return null;
}

function runPasswdLookup(command: string, args: string[], uid: number): string | null {
  if (!existsSync(command)) return null;
  const result = spawnSync(command, args, {
    encoding: "utf8",
    env: { PATH: "/usr/bin:/bin", LC_ALL: "C" },
    timeout: 2_000,
  });
  return result.status === 0 ? passwdHome(result.stdout, uid) : null;
}

async function canonicalIfPresent(path: string | null): Promise<string | null> {
  if (!path || !isAbsolute(path)) return path;
  try {
    return await realpath(path);
  } catch {
    return resolve(path);
  }
}

export async function inspectRuntimeIdentity(dataDir: string): Promise<RuntimeIdentity> {
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  let accountHome: string | null = null;
  let accountHomeSource: RuntimeIdentity["accountHomeSource"] = "unresolved";

  if (uid !== null && process.platform !== "win32") {
    if (process.platform === "darwin") {
      accountHome = runPasswdLookup("/usr/bin/id", ["-P", String(uid)], uid);
      if (accountHome) accountHomeSource = "bsd-id";
    }
    if (!accountHome) {
      try {
        accountHome = passwdHome(await readFile("/etc/passwd", "utf8"), uid);
        if (accountHome) accountHomeSource = "passwd";
      } catch {
        accountHome = null;
      }
    }
    if (!accountHome && process.platform === "linux") {
      const getent = existsSync("/usr/bin/getent") ? "/usr/bin/getent" : "/bin/getent";
      accountHome = runPasswdLookup(getent, ["passwd", String(uid)], uid);
      if (accountHome) accountHomeSource = "nss";
    }
  } else if (process.platform === "win32") {
    accountHome = process.env.USERPROFILE ?? (
      process.env.HOMEDRIVE && process.env.HOMEPATH
        ? `${process.env.HOMEDRIVE}${process.env.HOMEPATH}`
        : null
    );
    if (accountHome) accountHomeSource = "windows-environment";
  }

  const environmentHome = process.env.HOME ?? process.env.USERPROFILE ?? null;
  const canonicalAccountHome = await canonicalIfPresent(accountHome);
  const canonicalEnvironmentHome = await canonicalIfPresent(environmentHome);
  const authorityDataRoot = await canonicalIfPresent(resolve(dataDir)) as string;
  const warnings: string[] = [];
  if (!canonicalAccountHome) warnings.push("OS account home could not be resolved independently of the process environment");
  if (accountHomeSource === "windows-environment") warnings.push("Windows account home is environment-derived in this release");
  if (canonicalAccountHome && canonicalEnvironmentHome !== canonicalAccountHome) {
    warnings.push("Process HOME/USERPROFILE differs from the OS account home");
  }

  return {
    platform: process.platform,
    uid,
    accountHome: canonicalAccountHome,
    accountHomeSource,
    environmentHome: canonicalEnvironmentHome,
    environmentHomeMatchesAccount:
      canonicalAccountHome && canonicalEnvironmentHome
        ? canonicalAccountHome === canonicalEnvironmentHome
        : null,
    authorityDataRoot,
    warnings,
  };
}

function containsPath(container: string, candidate: string): boolean {
  const rel = relative(container, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

export function assertTargetExcludesProtectedRoots(
  target: string,
  protectedRoots: ReadonlyArray<{ label: string; path: string | null }>,
): void {
  for (const root of protectedRoots) {
    if (root.path && containsPath(target, root.path)) {
      throw new Error(`Deletion scope contains protected ${root.label}: ${root.path}`);
    }
  }
}
