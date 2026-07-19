import { describe, expect, test } from "bun:test";
import { analyzeParsedPowerShell, type ParsedPowerShell } from "../src/powershell-policy.js";

function categories(parsed: Partial<ParsedPowerShell>): string[] {
  return analyzeParsedPowerShell({
    errors: [],
    assignments: [],
    commands: [],
    ...parsed,
  }).map((finding) => finding.category);
}

function command(name: string | null, elements: string[], dynamic = false) {
  return { name, elements, dynamic, invocationOperator: "Unknown" };
}

describe("PowerShell policy", () => {
  test.each([
    [command("Remove-Item", ["Remove-Item", "-Recurse", "cache"]), "filesystem.delete"],
    [command("Clear-Content", ["Clear-Content", "production.db"]), "filesystem.overwrite"],
    [command("git", ["git", "reset", "--hard", "HEAD"]), "git.reset-hard"],
    [command("docker", ["docker", "system", "prune", "--volumes"]), "container.purge"],
    [command("psql", ["psql", "-c", "DROP TABLE users"]), "postgres.schema-mutate"],
    [command("cmd.exe", ["cmd.exe", "/c", "del", "/q", "state.db"]), "filesystem.delete"],
    [command("wsl.exe", ["wsl.exe", "--unregister", "Ubuntu"]), "infrastructure.destructive"],
    [command("stripe", ["stripe", "subscriptions", "cancel", "sub_live"]), "billing.destructive"],
    [command("Invoke-RestMethod", ["Invoke-RestMethod", "-Method", "Delete", "https://api.stripe.com/v1/subscriptions/sub_live"]), "billing.destructive"],
    [command("Invoke-WebRequest", ["Invoke-WebRequest", "-Method", "Delete", "https://api.example.com/accounts/1"]), "remote-service.destructive"],
    [command("Invoke-Expression", ["Invoke-Expression", "$payload"]), "opaque.execution"],
    [command("cleanup.ps1", ["cleanup.ps1"]), "opaque.execution"],
  ])("classifies native AST command %#", (parsedCommand, expected) => {
    expect(categories({ commands: [parsedCommand] })).toContain(expected);
  });

  test("blocks protected environment-root assignments", () => {
    expect(categories({ assignments: ["HOME", "USERPROFILE"] })).toContain("identity.root-override");
  });

  test("fails closed on parser errors and dynamic invocation", () => {
    expect(categories({ errors: ["Unexpected token"] })).toContain("opaque.execution");
    expect(categories({ commands: [command(null, ["&", "$script"], true)] })).toContain("opaque.execution");
  });

  test("allows a parsed read-only command", () => {
    expect(categories({ commands: [command("git", ["git", "status", "--short"])] })).toEqual([]);
  });
});
