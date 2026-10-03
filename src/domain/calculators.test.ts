import { describe, expect, it } from "vitest";
import { confusion, cosine, parseVector, wilson } from "./calculators";

describe("cosine similarity", () => {
  it("compares direction, including negative and orthogonal vectors", () => {
    expect(cosine([1, 2], [2, 4])).toBeCloseTo(1);
    expect(cosine([1, 0], [0, 1])).toBe(0);
    expect(cosine([1, 2], [-1, -2])).toBeCloseTo(-1);
  });
  it("normalizes extreme finite values before computing norms", () => {
    expect(cosine([1e308, 1e308], [1e-308, 1e-308])).toBeCloseTo(1);
  });
  it("rejects zero vectors, mismatched lengths and nonfinite values", () => {
    for (const [a, b] of [
      [[], []],
      [
        [0, 0],
        [1, 2],
      ],
      [[1], [1, 2]],
      [[NaN], [1]],
      [[Infinity], [1]],
    ]) {
      expect(cosine(a, b)).toBeNull();
    }
  });
  it("parses comma or space separated numbers without turning blanks into zero", () => {
    expect(parseVector("1, 2, -3e2")).toEqual([1, 2, -300]);
    expect(parseVector("1 2 3")).toEqual([1, 2, 3]);
    expect(parseVector("1,,2")).toBeNull();
    expect(parseVector("")).toBeNull();
    expect(parseVector("NaN")).toBeNull();
    expect(parseVector("1e999")).toBeNull();
  });
});

describe("Wilson interval", () => {
  it("reports a 95 percent interval for independent binomial cases", () => {
    const result = wilson(16, 20)!;
    expect(result[0]).toBeCloseTo(0.58398, 4);
    expect(result[1]).toBeCloseTo(0.91934, 4);
    expect(wilson(0, 20)![0]).toBe(0);
    expect(wilson(20, 20)![1]).toBe(1);
  });
  it("rejects impossible, empty and unsafe counts", () => {
    for (const [success, total] of [
      [1, 0],
      [-1, 5],
      [6, 5],
      [0.5, 5],
      [1, Infinity],
      [1, Number.MAX_SAFE_INTEGER + 1],
    ]) {
      expect(wilson(success, total)).toBeNull();
    }
  });
});

describe("confusion matrix", () => {
  it("calculates rates from labelled outcomes", () => {
    expect(confusion(8, 4, 2, 6)).toEqual({
      precision: 2 / 3,
      recall: 0.8,
      f1: 16 / 22,
      accuracy: 0.7,
    });
  });
  it("preserves undefined denominators", () => {
    expect(confusion(0, 0, 0, 0)).toEqual({
      precision: null,
      recall: null,
      f1: null,
      accuracy: null,
    });
    expect(confusion(0, 0, 2, 2)?.precision).toBeNull();
  });
  it("rejects negative or fractional counts and unsafe totals", () => {
    expect(confusion(-1, 2, 3, 4)).toBeNull();
    expect(confusion(0.5, 2, 3, 4)).toBeNull();
    expect(confusion(Number.MAX_SAFE_INTEGER, 1, 0, 0)).toBeNull();
  });
});
