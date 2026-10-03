function unitVector(vector: number[]): number[] | null {
  const scale = vector.reduce(
    (largest, value) => Math.max(largest, Math.abs(value)),
    0,
  );
  if (!scale) return null;
  const scaled = vector.map((value) => value / scale);
  const norm = Math.sqrt(scaled.reduce((sum, value) => sum + value * value, 0));
  return scaled.map((value) => value / norm);
}

export function cosine(a: number[], b: number[]): number | null {
  if (
    !a.length ||
    a.length !== b.length ||
    [...a, ...b].some((value) => !Number.isFinite(value))
  )
    return null;
  const x = unitVector(a);
  const y = unitVector(b);
  if (!x || !y) return null;
  return Math.max(
    -1,
    Math.min(
      1,
      x.reduce((sum, value, i) => sum + value * y[i], 0),
    ),
  );
}

export function parseVector(text: string): number[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parts = trimmed.includes(",")
    ? trimmed.split(",")
    : trimmed.split(/\s+/);
  if (parts.some((part) => !part.trim())) return null;
  const values = parts.map(Number);
  return values.every(Number.isFinite) ? values : null;
}

export function wilson(
  successes: number,
  total: number,
): [number, number] | null {
  if (
    !Number.isSafeInteger(total) ||
    !Number.isSafeInteger(successes) ||
    total <= 0 ||
    successes < 0 ||
    successes > total
  )
    return null;
  const z = 1.96;
  const p = successes / total;
  const denominator = 1 + (z * z) / total;
  const centre = (p + (z * z) / (2 * total)) / denominator;
  const half =
    (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) /
    denominator;
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

export function confusion(tp: number, fp: number, fn: number, tn: number) {
  if (
    [tp, fp, fn, tn].some((value) => !Number.isSafeInteger(value) || value < 0)
  )
    return null;
  if (!Number.isSafeInteger(tp + fp + fn + tn)) return null;
  const divide = (a: number, b: number) => (b ? a / b : null);
  return {
    precision: divide(tp, tp + fp),
    recall: divide(tp, tp + fn),
    f1: divide(2 * tp, 2 * tp + fp + fn),
    accuracy: divide(tp + tn, tp + fp + fn + tn),
  };
}
