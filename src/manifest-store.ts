import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { atomicWriteFile, withFileLock } from "./atomic-file.js";
import { RecoveryManifest, type RecoveryManifest as RecoveryManifestType } from "./manifest-contracts.js";

interface ManifestDocument {
  manifests: Record<string, RecoveryManifestType>;
}

export class ManifestStore {
  private readonly path: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly dataDir: string) {
    this.path = join(dataDir, "manifests.json");
  }

  private async read(): Promise<ManifestDocument> {
    await mkdir(this.dataDir, { recursive: true, mode: 0o700 });
    try {
      const raw = JSON.parse(await readFile(this.path, "utf8")) as ManifestDocument;
      const manifests = Object.fromEntries(
        Object.entries(raw.manifests ?? {}).map(([id, manifest]) => [id, RecoveryManifest.parse(manifest)]),
      );
      return { manifests };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { manifests: {} };
      throw error;
    }
  }

  private async write(document: ManifestDocument): Promise<void> {
    await atomicWriteFile(this.path, `${JSON.stringify(document, null, 2)}\n`);
  }

  async put(manifest: RecoveryManifestType): Promise<void> {
    const update = this.writeQueue.then(() => withFileLock(this.path, async () => {
      const document = await this.read();
      document.manifests[manifest.id] = RecoveryManifest.parse(manifest);
      await this.write(document);
    }));
    this.writeQueue = update.catch(() => undefined);
    await update;
  }

  async beginCommit(id: string): Promise<RecoveryManifestType> {
    let started: RecoveryManifestType | undefined;
    const update = this.writeQueue.then(() => withFileLock(this.path, async () => {
      const document = await this.read();
      const manifest = document.manifests[id];
      if (!manifest) throw new Error(`Unknown recovery manifest: ${id}`);
      if (manifest.status !== "prepared") throw new Error(`Manifest is not committable: ${manifest.status}`);
      started = RecoveryManifest.parse({ ...manifest, status: "committing", failure: null });
      document.manifests[id] = started;
      await this.write(document);
    }));
    this.writeQueue = update.catch(() => undefined);
    await update;
    return started as RecoveryManifestType;
  }

  async get(id: string): Promise<RecoveryManifestType> {
    await this.writeQueue;
    const manifest = (await this.read()).manifests[id];
    if (!manifest) throw new Error(`Unknown recovery manifest: ${id}`);
    return manifest;
  }

  async list(): Promise<RecoveryManifestType[]> {
    await this.writeQueue;
    return Object.values((await this.read()).manifests);
  }
}
