import { Interpretation, Comparison } from "../interfaces/interfaces";

function identifyUnknownOperations(
  comparisons: Comparison[]
): Interpretation | undefined {
  let unknownCount = 0;
  const comparisonStatuses = new Set();
  let interpretation = "unknown ";

  for (const comparison of comparisons) {
    // the remaining transactions should all be matching
    // ones; therefore, skip them
    if (comparison.status.startsWith("Match")) {
      continue;
    }

    // add the remaining non-matching transactions'
    // statuses to the set of unknown statuses
    comparisonStatuses.add(comparison.status);
    unknownCount++;
  }

  interpretation +=
    "(" + Array.from(comparisonStatuses.values()).join(", ") + ")";

  if (unknownCount != 0) {
    return {
      interpretation,
      // identification of unknown comparison statuses is certain
      // as it is a catch-all identification:
      certainty: true,
      interpretedItemsCount: unknownCount,
    };
  }

  return undefined;
}

export { identifyUnknownOperations };
