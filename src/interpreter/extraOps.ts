import { Interpretation, Comparison } from "../interfaces/interfaces";

function identifyDuplicatedOperations(
  comparisons: Comparison[]
): Interpretation | undefined {
  const duplicatedOperations: string[] = [];

  for (let i = comparisons.length - 1; i >= 0; i--) {
    const comparison = comparisons[i];

    if (comparison.status !== "Extra Operation") {
      continue;
    }

    // an operation is duplicated when:
    // (a) it is an extra operation, AND
    // (b) it appears somewhere else in the report
    //     (i.e., same txid, amount, and operation type)
    const txid = comparison.imported.txid;
    const amount = comparison.imported.amount;
    const operationType = comparison.imported.operationType;

    const txidsOccurrences = comparisons.filter(
      (comparison) =>
        comparison.imported.txid === txid &&
        comparison.imported.amount === amount &&
        comparison.imported.operationType === operationType
    ).length;

    if (comparison.status === "Extra Operation" && txidsOccurrences >= 2) {
      comparisons.splice(i, 1);
      duplicatedOperations.push(txid!);
    }
  }

  const duplicatedOperationsCount = duplicatedOperations.length;

  if (duplicatedOperationsCount != 0) {
    return {
      interpretation: "duplicated operation",
      // identification of duplicated operations is certain
      // as their comparison status is unambiguous (`Extra Operation`)
      // as well as their duplicated nature:
      certainty: true,
      interpretedItemsCount: duplicatedOperationsCount,
    };
  }

  return undefined;
}

function identifyUniqueExtraOperations(
  comparisons: Comparison[]
): Interpretation | undefined {
  let uniqueExtraOperations = 0;

  for (let i = comparisons.length - 1; i >= 0; i--) {
    const comparison = comparisons[i];

    // an operation is a unique extra operation when:
    // (a) it is an extra operation, AND
    // (b) it does NOT appear somewhere else in the report (implicitely)
    if (comparison.status === "Extra Operation") {
      comparisons.splice(i, 1);
      uniqueExtraOperations++;
    }
  }

  if (uniqueExtraOperations != 0) {
    return {
      interpretation: "nonduplicated extra operation",
      // identification of duplicated operations is certain
      // as their comparison status is unambiguous (`Extra Operation`)
      // as well as their unique nature:
      certainty: true,
      interpretedItemsCount: uniqueExtraOperations,
    };
  }

  return undefined;
}

export { identifyDuplicatedOperations, identifyUniqueExtraOperations };
