import { Interpretation, Comparison } from "../interfaces/interfaces";

function identifyUnknownOperations(
  comparisons: Comparison[]
): Interpretation | undefined {
  let unknownCount = 0;
  const comparisonStatuses = new Set();
  let interpretation = "unknown ";

  for (const comparison of comparisons) {
    if (comparison.status.startsWith("Match")) {
      continue;
    }

    comparisonStatuses.add(comparison.status);
    unknownCount++;
  }

  interpretation +=
    "(" + Array.from(comparisonStatuses.values()).join(", ") + ")";

  if (unknownCount != 0) {
    return {
      interpretation,
      certainty: true,
      interpretedItemsCount: unknownCount,
    };
  }

  return undefined;
}

export { identifyUnknownOperations };
