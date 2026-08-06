const COMPACT_COUNT_TIERS: {
  threshold: number;
  divisor: number;
  suffix: string;
}[] = [
  { threshold: 1_000_000_000, divisor: 1_000_000_000, suffix: "b" },
  { threshold: 1_000_000, divisor: 1_000_000, suffix: "m" },
  { threshold: 1_000, divisor: 1_000, suffix: "k" },
];

/** Formats large counts compactly, e.g. 1500 -> "1.5k", 10000 -> "10k", 2300000 -> "2.3m". */
export function formatCompactCount(count: number): string {
  for (const { threshold, divisor, suffix } of COMPACT_COUNT_TIERS) {
    if (count >= threshold) {
      const rounded = Math.round((count / divisor) * 10) / 10;
      return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}${suffix}`;
    }
  }

  return String(count);
}
