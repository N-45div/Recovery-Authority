import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evaluateConsequenceCorpus } from "../src/consequence-eval.js";
import { projectConsequenceGraph } from "../src/consequence-graph.js";
import { PURGE_VECTOR_CORPUS } from "../src/purge-vectors.js";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("consequence graph evaluation", () => {
  test("detects and fails closed over the complete evidence corpus", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "recovery-eval-"));
    roots.push(dataDir);
    const evaluation = evaluateConsequenceCorpus(await projectConsequenceGraph(dataDir));

    expect(evaluation.summary.vectors).toBe(PURGE_VECTOR_CORPUS.length);
    expect(evaluation.summary.categoryMatches).toBe(PURGE_VECTOR_CORPUS.length);
    expect(evaluation.summary.failClosed).toBe(PURGE_VECTOR_CORPUS.length);
    expect(evaluation.summary.categoryRecall).toBe(1);
    expect(evaluation.summary.failClosedRate).toBe(1);
    expect(JSON.stringify(evaluation)).not.toContain(PURGE_VECTOR_CORPUS[0]?.command ?? "missing");
  });
});
