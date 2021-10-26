import { Interpretation, Comparison } from "../interfaces/interfaces";

function identifyMismatches(
  comparisons: Comparison[],
  mismatchType: string
): Interpretation | undefined {
  let mismatchesCount = 0;

  for (let i = comparisons.length - 1; i >= 0; i--) {
    const comparison = comparisons[i];

    // identify mismatches by mismatch type
    if (comparison.status === mismatchType) {
      comparisons.splice(i, 1);
      mismatchesCount++;
    }
  }

  if (mismatchesCount != 0) {
    return {
      interpretation: mismatchType,
      certainty: true,
      interpretedItemsCount: mismatchesCount,
    };
  }

  return undefined;
}

export { identifyMismatches };
