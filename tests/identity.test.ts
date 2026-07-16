import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { assertTargetExcludesProtectedRoots, inspectRuntimeIdentity } from "../src/identity.js";

describe("runtime identity", () => {
  test("resolves an authority data root and reports HOME drift explicitly", async () => {
    const identity = await inspectRuntimeIdentity("./.recovery-authority");
    expect(identity.authorityDataRoot).toMatch(/^\//);
    expect(identity.environmentHomeMatchesAccount === null || typeof identity.environmentHomeMatchesAccount === "boolean").toBe(true);
  });

  test("rejects a deletion scope that contains a protected root", () => {
    expect(() => assertTargetExcludesProtectedRoots("/home/user", [
      { label: "account home", path: "/home/user" },
    ])).toThrow("protected account home");

    expect(() => assertTargetExcludesProtectedRoots("/home", [
      { label: "account home", path: "/home/user" },
    ])).toThrow("protected account home");
  });

  test("allows a sibling deletion scope", () => {
    expect(() => assertTargetExcludesProtectedRoots("/workspace/cache", [
      { label: "authority data root", path: join("/workspace", ".authority") },
    ])).not.toThrow();
  });
});
