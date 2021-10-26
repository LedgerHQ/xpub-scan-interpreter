import chalk from "chalk";
import fs from "fs";

import { Comparison, Statistics } from "./interfaces/interfaces";
import { getInterpretation } from "./interpreter/interpret";
import { translateIntoHumanLanguage } from "./translator/translate";

function parseReport(filepath: string) {
  let jsonFile;
  try {
    jsonFile = fs.readFileSync(filepath, "utf8");
  } catch (err) {
    throw console.error("The file cannot be opened");
  }

  let xpubScanReport;

  try {
    xpubScanReport = JSON.parse(jsonFile);
  } catch (err) {
    throw console.error("File is not a valid JSON");
  }

  // check report
  const meta = xpubScanReport["meta"];

  if (typeof meta === "undefined" || !meta["by"].includes("xpub scan")) {
    throw console.error("Not an Xpub Scan report");
  }

  const comparisons = xpubScanReport["comparisons"];

  if (typeof comparisons === "undefined") {
    throw console.error("This report does not contain any comparison");
  }

  return xpubScanReport;
}

function getStatistics(xpubScanReport: any) {
  const comparisons = xpubScanReport["comparisons"];

  const comparisonsCount = comparisons.length;
  const matchesCount = comparisons.filter((comparison: Comparison) =>
    comparison.status.includes("Match")
  ).length;
  const mismatchesCount = comparisonsCount - matchesCount;

  const stats: Statistics = {
    occurrences: {
      comparisons: comparisonsCount,
      matches: matchesCount,
      mismatches: mismatchesCount,
    },
  };

  return stats;
}

const xpubScanReport = parseReport(process.argv[2]);
const stats = getStatistics(xpubScanReport);

const comparisons = xpubScanReport["comparisons"];

const interpretations = getInterpretation(comparisons, stats);

// show pre-transalted interpretation
//console.dir(interpretations);

console.log(chalk.bold("\nSuggested interpretation\n"));
console.log(chalk.whiteBright(translateIntoHumanLanguage(interpretations)));
