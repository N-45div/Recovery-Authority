import { describe, expect, test } from "bun:test";
import { formatApprovalCommand, formatManifestApprovalCommand, ipcEndpoint, platformCapabilities } from "../src/platform.js";

describe("platform adapters", () => {
  test("reports native containment and transport boundaries honestly", () => {
    expect(platformCapabilities("linux")).toMatchObject({
      ipcTransport: "unix-socket",
      containmentProvider: "recovery-authority-bubblewrap",
      independentAuthorityIsolation: true,
    });
    expect(platformCapabilities("darwin")).toMatchObject({
      containmentProvider: "host-sandbox",
      independentAuthorityIsolation: false,
    });
    expect(platformCapabilities("win32")).toMatchObject({
      shellDialect: "powershell",
      ipcTransport: "named-pipe",
      containmentProvider: "host-sandbox",
      recoveryAdapters: { filesystemDelete: false, sqliteMutation: true },
    });
  });

  test("formats approval commands for POSIX and PowerShell without shell scripts", () => {
    const posix = formatApprovalCommand("/opt/plugin/dist/authority.js", "op-1", "/tmp/data", "/tmp/keys", "linux");
    expect(posix).toContain("bun '/opt/plugin/dist/authority.js' 'approve' 'op-1'");
    expect(posix).not.toContain(".sh");

    const windows = formatApprovalCommand(
      "C:\\Program Files\\Recovery Authority\\dist\\cli.js",
      "op'2",
      "C:\\Data",
      "C:\\Keys",
      "win32",
    );
    expect(windows).toContain("& bun 'C:\\Program Files\\Recovery Authority\\dist\\cli.js' 'approve' 'op''2'");
    expect(windows).not.toContain(".sh");

    const manifest = formatManifestApprovalCommand("/opt/plugin/dist/authority.js", "manifest-1", "/tmp/data", "/tmp/keys", "linux");
    expect(manifest).toContain("bun '/opt/plugin/dist/authority.js' 'approve-manifest' 'manifest-1'");
  });

  test("uses named pipes on Windows and Unix sockets elsewhere", () => {
    expect(ipcEndpoint("session:42", "win32")).toMatch(/^\\\\\.\\pipe\\recovery-authority-session-42-/);
    expect(ipcEndpoint("session:42", "linux")).toMatch(/recovery-authority-session-42-[a-f0-9]+\.sock$/);
  });
});
