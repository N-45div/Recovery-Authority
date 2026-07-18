import type { ConsequenceGraph } from "./consequence-graph.js";
import { orientConsequences } from "./consequence-graph.js";
import { PURGE_VECTOR_CORPUS } from "./purge-vectors.js";

export interface ConsequenceEvaluationResult {
  generatedAt: string;
  summary: {
    vectors: number;
    categoryMatches: number;
    failClosed: number;
    exactAdapterVectors: number;
    blockOnlyVectors: number;
    categoryRecall: number;
    failClosedRate: number;
  };
  results: Array<{
    id: string;
    expectedCategory: string;
    detectedCategories: string[];
    categoryMatched: boolean;
    failClosed: boolean;
    recoveryCoverage: number;
    authority: number;
    safeCutRequirements: string[];
    evidence: string;
    sourceUrl: string;
  }>;
}

export function evaluateConsequenceCorpus(graph: ConsequenceGraph): ConsequenceEvaluationResult {
  const results = PURGE_VECTOR_CORPUS.map((vector) => {
    const orientation = orientConsequences(graph, { command: vector.command, shellDialect: "posix" });
    const detectedCategories = [...new Set(orientation.findings.map((finding) => finding.category))];
    return {
      id: vector.id,
      expectedCategory: vector.expectedCategory,
      detectedCategories,
      categoryMatched: detectedCategories.includes(vector.expectedCategory),
      failClosed: orientation.destructive && orientation.executable === false,
      recoveryCoverage: orientation.readiness.recoveryCoverage,
      authority: orientation.readiness.authority,
      safeCutRequirements: [...new Set(orientation.safeCut.map((item) => item.requirement))],
      evidence: vector.evidence,
      sourceUrl: vector.sourceUrl,
    };
  });
  const categoryMatches = results.filter((result) => result.categoryMatched).length;
  const failClosed = results.filter((result) => result.failClosed).length;
  const exactAdapterVectors = results.filter((result) => result.safeCutRequirements.some((requirement) =>
    requirement === "prepare_proof" || requirement === "human_approval" || requirement === "exact_commit_tool",
  )).length;
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      vectors: results.length,
      categoryMatches,
      failClosed,
      exactAdapterVectors,
      blockOnlyVectors: results.length - exactAdapterVectors,
      categoryRecall: Number((categoryMatches / results.length).toFixed(4)),
      failClosedRate: Number((failClosed / results.length).toFixed(4)),
    },
    results,
  };
}
