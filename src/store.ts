import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
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
    const temporaryPath = `${this.path}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, this.path);
  }

  async put(operation: RecoveryOperationType): Promise<void> {
    const update = this.writeQueue.then(async () => {
      const document = await this.read();
      document.operations[operation.id] = RecoveryOperation.parse(operation);
      await this.write(document);
    });
    this.writeQueue = update.catch(() => undefined);
    await update;
  }

  async get(id: string): Promise<RecoveryOperationType> {
    await this.writeQueue;
    const operation = (await this.read()).operations[id];
    if (!operation) throw new Error(`Unknown recovery operation: ${id}`);
    return operation;
  }
}
