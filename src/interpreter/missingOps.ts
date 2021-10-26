import { Interpretation, Comparison } from "../interfaces/interfaces";

const DUST_THRESHOLD = 1000;

// identify potential pagination issues by spotting
// clusters of nonspecific missing operations
function identifyPaginationIssue(
  comparisons: Comparison[]
): Interpretation | undefined {
  let previousIsMissing = false;
  const missingOperationsIndices = new Set<number>();

  comparisons.forEach(function (comparison, index) {
    if (comparison.status.startsWith("Missing")) {
      if (previousIsMissing) {
        missingOperationsIndices.add(index - 1);
        missingOperationsIndices.add(index);
      }
      previousIsMissing = true;
    } else {
      previousIsMissing = false;
    }
  });

  for (const index of Array.from(missingOperationsIndices).reverse()) {
    comparisons.splice(index, 1);
  }

  const missingFromPaginationIssueCount = missingOperationsIndices.size;

  if (missingFromPaginationIssueCount != 0) {
    return {
      interpretation: "pagination issue",
      certainty: false,
      interpretedItemsCount: missingFromPaginationIssueCount,
    };
  }

  return undefined;
}

function identifyNonspecificMissingOperations(
  comparisons: Comparison[]
): Interpretation | undefined {
  let missingOperationsCount = 0;

  for (let i = comparisons.length - 1; i >= 0; i--) {
    const comparison = comparisons[i];
    if (comparison.status.startsWith("Missing")) {
      comparisons.splice(i, 1);
      missingOperationsCount++;
    }
  }

  if (missingOperationsCount != 0) {
    return {
      interpretation: "nonspecific missing operation",
      certainty: true,
      interpretedItemsCount: missingOperationsCount,
    };
  }

  return undefined;
}

function identifyDusts(comparisons: Comparison[]): Interpretation | undefined {
  let dustsCount = 0;

  for (let i = comparisons.length - 1; i >= 0; i--) {
    const comparison = comparisons[i];

    if (typeof comparison.actual === "undefined") {
      continue;
    }

    const amount = comparison.actual.amount;

    if (
      comparison.status.startsWith("Missing") &&
      comparison.actual.operationType === "Received" &&
      Number(amount) < DUST_THRESHOLD
    ) {
      comparisons.splice(i, 1);
      dustsCount++;
    }
  }

  if (dustsCount != 0) {
    return {
      interpretation: "dust",
      certainty: false,
      interpretedItemsCount: dustsCount,
    };
  }

  return undefined;
}

function identifyOutOfSync(
  comparisons: Comparison[],
  latest: boolean
): Interpretation[] {
  const interpretations: Interpretation[] = [];
  let interpretation = "";

  if (latest) {
    comparisons = comparisons.reverse();
  }

  let outOfSyncCount = 0;

  // operations are out of sync when, from the beginning or
  // the end of the report, they form a subset of operations
  // that are missing
  for (let i = comparisons.length - 1; i >= 0; i--) {
    const comparison = comparisons[i];
    if (comparison.status.startsWith("Missing")) {
      comparisons.splice(i, 1);
      interpretation = "Out of sync "
        .concat(latest ? "since " : "up to ")
        .concat(comparison.actual.date!);
      outOfSyncCount++;
    } else {
      break;
    }
  }

  if (outOfSyncCount != 0) {
    interpretations.push({
      interpretation,
      certainty: true,
      interpretedItemsCount: outOfSyncCount,
    });
  }

  if (latest) {
    comparisons = comparisons.reverse();
  }

  return interpretations;
}

export {
  identifyPaginationIssue,
  identifyNonspecificMissingOperations,
  identifyDusts,
  identifyOutOfSync,
};
