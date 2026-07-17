import { describe, expect, test } from "bun:test";
import {
  assertInsidePath,
  assertSafeRelativePath,
  containsPath,
  pathsEqual,
} from "../src/path-policy.js";

describe("cross-platform path policy", () => {
  test("uses case-insensitive Windows containment", () => {
    expect(containsPath("C:\\Users\\Ada\\repo", "c:\\users\\ada\\repo\\src\\app.ts", "win32")).toBe(true);
    expect(pathsEqual("C:\\Users\\Ada\\repo", "c:\\users\\ada\\repo\\", "win32")).toBe(true);
    expect(() => assertInsidePath("C:\\repo", "C:\\repo", "win32")).toThrow("equals");
  });

  test("rejects Windows traversal, drive paths, device paths, and alternate data streams", () => {
    expect(containsPath("C:\\repo", "C:\\repo-old\\state", "win32")).toBe(false);
    expect(() => assertSafeRelativePath("C:\\Users\\Ada", "win32")).toThrow("relative");
    expect(() => assertSafeRelativePath("file.txt:secret", "win32")).toThrow("alternate data streams");
    expect(() => assertSafeRelativePath("\\\\.\\PhysicalDrive0", "win32")).toThrow();
  });

  test("preserves POSIX sibling boundaries", () => {
    expect(containsPath("/workspace/repo", "/workspace/repo/src", "linux")).toBe(true);
    expect(containsPath("/workspace/repo", "/workspace/repository", "linux")).toBe(false);
  });
});
