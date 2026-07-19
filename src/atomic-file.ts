import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const LOCK_RETRY_MS = 20;
const LOCK_TIMEOUT_MS = 10_000;
const STALE_LOCK_MS = 30_000;

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

async function staleLock(lockPath: string): Promise<boolean> {
  try {
    const metadata = JSON.parse(await readFile(`${lockPath}/owner.json`, "utf8")) as {
      pid?: number;
      createdAt?: string;
    };
    const age = Date.now() - Date.parse(metadata.createdAt ?? "");
    return Number.isFinite(age) && age > STALE_LOCK_MS &&
      (!Number.isInteger(metadata.pid) || !processIsAlive(metadata.pid as number));
  } catch {
    try {
      return Date.now() - (await stat(lockPath)).mtimeMs > STALE_LOCK_MS;
    } catch {
      return false;
    }
  }
}

export async function withFileLock<T>(path: string, action: () => Promise<T>): Promise<T> {
  const lockPath = `${path}.lock`;
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  while (true) {
    try {
      await mkdir(lockPath, { mode: 0o700 });
      await writeFile(`${lockPath}/owner.json`, JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }), {
        mode: 0o600,
      });
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (await staleLock(lockPath)) {
        await rm(lockPath, { recursive: true, force: true });
        continue;
      }
      if (Date.now() >= deadline) throw new Error(`Timed out waiting for ledger lock: ${lockPath}`);
      await Bun.sleep(LOCK_RETRY_MS);
    }
  }
  try {
    return await action();
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

export async function atomicWriteFile(path: string, contents: string): Promise<void> {
  const temporaryPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, contents, { mode: 0o600 });
  const file = await open(temporaryPath, "r");
  try {
    await file.sync();
  } finally {
    await file.close();
  }
  await rename(temporaryPath, path);
  const parent = await open(dirname(path), "r");
  try {
    await parent.sync();
  } finally {
    await parent.close();
  }
}
