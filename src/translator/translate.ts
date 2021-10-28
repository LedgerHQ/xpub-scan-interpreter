import { Interpretation } from "../interfaces/interfaces";

const TRANSITION_WORDS = [
  "Besides",
  "Furthermore",
  "Moreover",
  "In addition",
  "Also",
];

const UNCERTAINTY_WORDS = ["it is probable that", "it seems that"];

function shuffleWords(words: string[]) {
  const shuffledWords = words;

  for (let i = shuffledWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
  }

  return shuffledWords;
}

function translate(interpretation: Interpretation): string {
  const itemsCount = interpretation.interpretedItemsCount;
  // const itemsData = int.itemsData;
  const interpretationStatus = interpretation.interpretation;

  let sentence = "";
  const plural = itemsCount! > 1 || false;
  const itemsCountsAsString = itemsCount?.toLocaleString();

  switch (interpretationStatus) {
    // perfect matching: `No issue detected`
    case "perfect matching":
      sentence += "No issue has been detected";
      break;

    // skipped comparisons: `_n_ comparison|s has|have been skipped because the block
    //                      `height upper limit has been reached`
    case "skipped comparisons":
      sentence += `${itemsCountsAsString} comparison${
        plural ? "s have" : "has"
      } been skipped `;
      sentence += `because the block height upper limit has been reached`;
      break;

    // dust: `there is|are _n_ dust operation|s`
    case "dust":
      sentence += `there ${plural ? "are " : "is "}`;
      sentence += `${itemsCountsAsString} dust operation${plural ? "s" : ""}`;
      break;

    // pagination issue: `there is|are _n_ operation|s missing because of a pagination issue`
    case "pagination issue":
      sentence += `there ${plural ? "are " : "is "}`;
      sentence += `${itemsCountsAsString} operation${
        plural ? "s" : ""
      } missing because of a pagination issue`;
      break;

    // nonspecific missing operation: `_n_ nonspecific operation|s is|are missing`
    case "nonspecific missing operation":
      sentence += `${itemsCountsAsString} nonspecific operation`;
      sentence += `${plural ? "s are" : " is"} missing`;
      break;

    // duplicated operation: `_n_ operation|s is|are duplicated`
    case "duplicated operation":
      sentence += `${itemsCountsAsString} operation${
        plural ? "s are" : " is"
      } duplicated`;

      break;

    // nonduplicated operation: `there is|are _n_ operation|s which is an|which are extra operation|s
    //                          `but not a| duplication|s of an| existing operation|s`
    case "nonduplicated extra operation":
      sentence += `there ${plural ? "are " : "is "}`;
      sentence += `${itemsCountsAsString} operation${
        plural ? "s which are" : " which is an"
      } `;
      sentence += `extra operation${plural ? "s" : ""} but `;
      sentence += `not${plural ? "" : " a"} duplication${plural ? "s" : ""} of${
        plural ? "" : " an"
      } existing operation${plural ? "s" : ""}`;
      break;

    // mismatches: `_n_ operation|s has|have an erroneous _mismatchType_`
    case "Mismatch: addresses":
      sentence += `${itemsCountsAsString} operation${
        plural ? "s have" : " has"
      } an erroneous derived address`;
      break;
    case "Mismatch: amounts":
      sentence += `${itemsCountsAsString} operation${
        plural ? "s have" : " has"
      } an erroneous amount`;
      break;
    case "Mismatch: token amounts":
      sentence += `${itemsCountsAsString} token-related operation${
        plural ? "s have" : " has"
      } an erroneous amount`;
      break;
    case "Mismatch: token tickers":
      sentence += `${itemsCountsAsString} token-related operation${
        plural ? "s have" : " has"
      } an erroneous ticker`;
      break;

    // unknown: `there is|are _n_ comparison|s that is|that are unknown (_statuses_)`
    case interpretationStatus.match(/^unknown.*/)?.input:
      sentence += `there ${plural ? "are " : "is "}`;
      sentence += `${itemsCountsAsString} comparison${
        plural ? "s that are" : " that is"
      } ${interpretationStatus}`;
      break;

    // catch-all: just return the interpretation status
    default:
      sentence = interpretationStatus;
      break;
  }

  return sentence;
}

function translateIntoHumanLanguage(interpretations: Interpretation[]) {
  const transitionWords = shuffleWords(TRANSITION_WORDS);
  const uncertaintyWords = shuffleWords(UNCERTAINTY_WORDS);
  let translation = "";

  interpretations.forEach(function (interpretation, i) {
    const certain = interpretation.certainty;

    translation =
      interpretations.length > 1 && translation
        ? translation
            .concat(transitionWords[i % transitionWords.length])
            .concat(", ")
        : "";

    // if the interpretation is uncertain, use a random indicator of uncertainty
    if (!certain) {
      translation += `${uncertaintyWords[i % uncertaintyWords.length]} `;
    }

    translation += `${translate(interpretation)}. `;
  });

  // ensure that the first char of the sentence is uppercased
  translation = translation.charAt(0).toUpperCase() + translation.slice(1);

  return translation;
}

export { translateIntoHumanLanguage };
