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
    // pattern revealing a possible pagination issue:
    // (a) missing operation that is, so far, non specific, AND
    // (b) the previous operation is also a nonspecific missing one
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
      // identification of pagination issues is ambiguous
      // as clusters of nonspecific missing operations can potentially
      // be just coincidental:
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
      // identification of nonspecific missing operations is certain
      // as this category is vague (catch-all category):
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

    // a dust operation is:
    // (a) a missing operation
    // (b) which is a received one, AND
    // (c) whose amount is under a given threshold

    if (
      comparison.status.startsWith("Missing") &&
      comparison.actual.operationType?.startsWith("Received") &&
      Number(amount) <= DUST_THRESHOLD
    ) {
      comparisons.splice(i, 1);
      dustsCount++;
    }
  }

  if (dustsCount != 0) {
    return {
      interpretation: "dust",
      // identification of dust operations is uncertain (at this stage)
      // as the threshold should be dynamic:
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
      interpretation = "out of sync "
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
      // identification of out of sync operations is certain
      // as they are spotted by reference to the beginning or
      // the end of the list of comparisons:
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
