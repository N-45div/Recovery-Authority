import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface PlatformCapabilities {
  platform: NodeJS.Platform;
  shellDialect: "powershell" | "posix";
  ipcTransport: "named-pipe" | "unix-socket";
  containmentProvider: "recovery-authority-bubblewrap" | "host-sandbox" | "none";
  independentAuthorityIsolation: boolean;
  recoveryAdapters: {
    filesystemDelete: boolean;
    sqliteMutation: boolean;
    gitResetHard: boolean;
    postgresMutation: boolean;
  };
}

function recoveryAdapters(platform: NodeJS.Platform): PlatformCapabilities["recoveryAdapters"] {
  return {
    filesystemDelete: platform !== "win32",
    sqliteMutation: ["linux", "darwin", "win32"].includes(platform),
    gitResetHard: ["linux", "darwin", "win32"].includes(platform),
    postgresMutation: ["linux", "darwin", "win32"].includes(platform),
  };
}

export function platformCapabilities(platform: NodeJS.Platform = process.platform): PlatformCapabilities {
  if (platform === "win32") {
    return {
      platform,
      shellDialect: "powershell",
      ipcTransport: "named-pipe",
      containmentProvider: "host-sandbox",
      independentAuthorityIsolation: false,
      recoveryAdapters: recoveryAdapters(platform),
    };
  }
  if (platform === "linux") {
    return {
      platform,
      shellDialect: "posix",
      ipcTransport: "unix-socket",
      containmentProvider: "recovery-authority-bubblewrap",
      independentAuthorityIsolation: true,
      recoveryAdapters: recoveryAdapters(platform),
    };
  }
  if (platform === "darwin") {
    return {
      platform,
      shellDialect: "posix",
      ipcTransport: "unix-socket",
      containmentProvider: "host-sandbox",
      independentAuthorityIsolation: false,
      recoveryAdapters: recoveryAdapters(platform),
    };
  }
  return {
    platform,
    shellDialect: "posix",
    ipcTransport: "unix-socket",
    containmentProvider: "none",
    independentAuthorityIsolation: false,
    recoveryAdapters: recoveryAdapters(platform),
  };
}

function quotePosix(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function quotePowerShell(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function formatApprovalCommand(
  cliEntry: string,
  operationId: string,
  dataDir: string,
  keyDir: string,
  platform: NodeJS.Platform = process.platform,
): string {
  const values = [cliEntry, "approve", operationId, "--data-dir", dataDir, "--key-dir", keyDir];
  if (platform === "win32") return `& bun ${values.map(quotePowerShell).join(" ")}`;
  return `bun ${values.map(quotePosix).join(" ")}`;
}

export function formatManifestApprovalCommand(
  cliEntry: string,
  manifestId: string,
  dataDir: string,
  keyDir: string,
  platform: NodeJS.Platform = process.platform,
): string {
  const values = [cliEntry, "approve-manifest", manifestId, "--data-dir", dataDir, "--key-dir", keyDir];
  if (platform === "win32") return `& bun ${values.map(quotePowerShell).join(" ")}`;
  return `bun ${values.map(quotePosix).join(" ")}`;
}

export function ipcEndpoint(name: string, platform: NodeJS.Platform = process.platform): string {
  const safeName = name.replaceAll(/[^A-Za-z0-9_.-]/g, "-").slice(0, 72);
  const digest = createHash("sha256").update(name).digest("hex").slice(0, 12);
  if (platform === "win32") return `\\\\.\\pipe\\recovery-authority-${safeName}-${digest}`;
  return join(tmpdir(), `recovery-authority-${safeName}-${digest}.sock`);
}
