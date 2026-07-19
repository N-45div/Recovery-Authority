import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { atomicWriteFile, withFileLock } from "./atomic-file.js";
import { RecoveryOperation, type RecoveryOperation as RecoveryOperationType } from "./contracts.js";

interface StoreDocument {
  operations: Record<string, RecoveryOperationType>;
}

export class OperationStore {
  private readonly path: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly dataDir: string) {
    this.path = join(dataDir, "operations.json");
  }

  private async read(): Promise<StoreDocument> {
    await mkdir(this.dataDir, { recursive: true, mode: 0o700 });
    try {
      const raw = JSON.parse(await readFile(this.path, "utf8")) as unknown;
      const operations = Object.fromEntries(
        Object.entries((raw as StoreDocument).operations ?? {}).map(([id, operation]) => [
          id,
          RecoveryOperation.parse(operation),
        ]),
      );
      return { operations };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { operations: {} };
      throw error;
    }
  }

  private async write(document: StoreDocument): Promise<void> {
    await atomicWriteFile(this.path, `${JSON.stringify(document, null, 2)}\n`);
  }

  async put(operation: RecoveryOperationType): Promise<void> {
    const update = this.writeQueue.then(() => withFileLock(this.path, async () => {
      const document = await this.read();
      document.operations[operation.id] = RecoveryOperation.parse(operation);
      await this.write(document);
    }));
    this.writeQueue = update.catch(() => undefined);
    await update;
  }

  async beginCommit(id: string): Promise<RecoveryOperationType> {
    let started: RecoveryOperationType | undefined;
    const update = this.writeQueue.then(() => withFileLock(this.path, async () => {
      const document = await this.read();
      const operation = document.operations[id];
      if (!operation) throw new Error(`Unknown recovery operation: ${id}`);
      if (operation.status !== "proven") throw new Error(`Operation is not committable: ${operation.status}`);
      started = RecoveryOperation.parse({ ...operation, status: "committing", failure: null });
      document.operations[id] = started;
      await this.write(document);
    }));
    this.writeQueue = update.catch(() => undefined);
    await update;
    return started as RecoveryOperationType;
  }

  async get(id: string): Promise<RecoveryOperationType> {
    await this.writeQueue;
    const operation = (await this.read()).operations[id];
    if (!operation) throw new Error(`Unknown recovery operation: ${id}`);
    return operation;
  }

  async list(): Promise<RecoveryOperationType[]> {
    await this.writeQueue;
    return Object.values((await this.read()).operations);
  }
}
