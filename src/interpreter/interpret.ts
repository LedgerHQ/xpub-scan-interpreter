import {
  Interpretation,
  Comparison,
  Statistics,
} from "../interfaces/interfaces";

import {
  identifyPaginationIssue,
  identifyOutOfSync,
  identifyDusts,
  identifyNonspecificMissingOperations,
} from "./missingOps";

import {
  identifyDuplicatedOperations,
  identifyUniqueExtraOperations,
} from "./extraOps";

import { identifyMismatches } from "./mismatches";
import { identifyUnknownOperations } from "./unknownComparisons";

import chalk from "chalk";

function getInterpretation(
  comparisons: Comparison[],
  stats: Statistics
): Interpretation[] {
  let interpretations: Interpretation[] = [];

  // -----------------
  // PERFECT MATCHING
  // -----------------

  // (matches count === comparisons count)
  if (stats.occurrences.matches === stats.occurrences.comparisons) {
    interpretations.push({
      interpretation: "perfect matching",
      certainty: true,
    });
  }

  // ------------------
  // MISSING OPERATIONS
  // ------------------

  console.log(chalk.greenBright("Processing missing operations"));

  // out of sync — oldest
  console.log(chalk.green(" ► out of sync (oldests)"));

  interpretations = interpretations.concat(
    identifyOutOfSync(comparisons, false)
  );

  // out of sync — latest
  console.log(chalk.green(" ► out of sync (latests)"));

  interpretations = interpretations.concat(
    identifyOutOfSync(comparisons, true)
  );

  // dust operations
  console.log(chalk.green(" ► dusts"));

  const dusts = identifyDusts(comparisons);

  if (typeof dusts !== "undefined") {
    interpretations.push(dusts);
  }

  // pagination issues
  console.log(chalk.green(" ► pagination issue"));

  const paginationIssue = identifyPaginationIssue(comparisons);

  if (typeof paginationIssue !== "undefined") {
    interpretations.push(paginationIssue);
  }

  // remaining missing operations — nonspecific missing operations
  console.log(chalk.green(" ► remaining operations"));

  const missingOperations = identifyNonspecificMissingOperations(comparisons);

  if (typeof missingOperations !== "undefined") {
    interpretations.push(missingOperations);
  }

  // ----------------
  // EXTRA OPERATIONS
  // ----------------

  console.log(chalk.greenBright("Processing extra operations"));

  // duplicated operations
  console.log(chalk.green(" ► duplicated operations"));

  const duplicatesExtraOperations = identifyDuplicatedOperations(comparisons);

  if (typeof duplicatesExtraOperations !== "undefined") {
    interpretations.push(duplicatesExtraOperations);
  }

  // unique extra operations
  console.log(chalk.green(" ► unique operations"));

  const uniqueExtraOperations = identifyUniqueExtraOperations(comparisons);

  if (typeof uniqueExtraOperations !== "undefined") {
    interpretations.push(uniqueExtraOperations);
  }

  // ----------
  // MISMATCHES
  // ----------

  console.log(chalk.greenBright("Processing mismatches"));

  for (const mismatchType of [
    "Mismatch: addresses",
    "Mismatch: amounts",
    "Mismatch: token amounts",
    "Mismatch: token tickers",
  ]) {
    console.log(chalk.green(" ► ".concat(mismatchType.toLocaleLowerCase())));

    const mismatches = identifyMismatches(comparisons, mismatchType);

    if (typeof mismatches !== "undefined") {
      interpretations.push(mismatches);
    }
  }

  // -------------------
  // UNKNOWN COMPARISONS
  // -------------------

  const unknown = identifyUnknownOperations(comparisons);

  if (typeof unknown !== "undefined") {
    interpretations.push(unknown);
  }

  return interpretations;
}

export { getInterpretation };
