import { posix, win32 } from "node:path";

function pathApi(platform: NodeJS.Platform): typeof posix {
  return platform === "win32" ? win32 : posix;
}

function comparisonPath(value: string, platform: NodeJS.Platform): string {
  const api = pathApi(platform);
  let normalized = api.normalize(value);
  if (platform === "win32") {
    normalized = normalized.replace(/^\\\\\?\\UNC\\/i, "\\\\").replace(/^\\\\\?\\/i, "");
    normalized = normalized.toLowerCase();
  }
  const root = api.parse(normalized).root;
  while (normalized.endsWith(api.sep) && normalized.length > root.length) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

export function pathsEqual(left: string, right: string, platform: NodeJS.Platform = process.platform): boolean {
  return comparisonPath(left, platform) === comparisonPath(right, platform);
}

export function containsPath(container: string, candidate: string, platform: NodeJS.Platform = process.platform): boolean {
  const api = pathApi(platform);
  const normalizedContainer = comparisonPath(container, platform);
  const normalizedCandidate = comparisonPath(candidate, platform);
  const rel = api.relative(normalizedContainer, normalizedCandidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${api.sep}`) && !api.isAbsolute(rel));
}

export function assertInsidePath(root: string, candidate: string, platform: NodeJS.Platform = process.platform): void {
  if (!containsPath(root, candidate, platform) || pathsEqual(root, candidate, platform)) {
    throw new Error(`Path escapes or equals the workspace root: ${candidate}`);
  }
}

export function assertWithinPath(root: string, candidate: string, platform: NodeJS.Platform = process.platform): void {
  if (!containsPath(root, candidate, platform)) {
    throw new Error(`Path escapes the workspace root through a symlink: ${candidate}`);
  }
}

export function assertSafeRelativePath(value: string, platform: NodeJS.Platform = process.platform): void {
  const api = pathApi(platform);
  if (!value || value === "." || api.isAbsolute(value)) {
    throw new Error(`Recovery scope must be a non-root relative path: ${value}`);
  }
  if (platform === "win32") {
    if (/^(?:\\\\[.?]\\|\\\?\\|\\\.\\)/.test(value)) {
      throw new Error(`Windows device paths are outside recoverable scope: ${value}`);
    }
    if (value.includes(":")) {
      throw new Error(`Windows drive-qualified paths and alternate data streams are outside recoverable scope: ${value}`);
    }
  }
}
