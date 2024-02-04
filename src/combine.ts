import * as fs from "fs";
import { ResultByTeam, TeamResult } from "./dates";
import { TeamData } from "./dates";
// Load data from JSON files
const resultByTeamFile = fs.readFileSync("./results/dates.json", "utf-8");
const dataFile = fs.readFileSync("./results/data.json", "utf-8");

const resultByTeam: ResultByTeam = JSON.parse(resultByTeamFile);
const data: TeamData[] = JSON.parse(dataFile);
// Update "h" and "a" objects with "avgLast6Xpts" value
Object.keys(resultByTeam).forEach((teamTitle) => {
  resultByTeam[teamTitle]!.forEach((match) => {
    const homeTeamId = match.h.id;
    const awayTeamId = match.a.id;

    const homeTeamData = data.find((team) => team.id === homeTeamId);
    const awayTeamData = data.find((team) => team.id === awayTeamId);

    if (homeTeamData) {
      match.h.avgLast6Xpts = homeTeamData.avgLast6Xpts;
    }

    if (awayTeamData) {
      match.a.avgLast6Xpts = awayTeamData.avgLast6Xpts;
    }
  });
});

const calculateAbsoluteDifference = (match: TeamResult) =>
  Math.abs(match.h.avgLast6Xpts! - match.a.avgLast6Xpts!);

// Flatten the array of matches and add an additional property "absoluteDifference"
const flattenedMatches = Object.keys(resultByTeam).reduce(
  (accumulator, teamTitle) => {
    const matches = resultByTeam[teamTitle]!.map((match) => ({
      ...match,
      absoluteDifference: calculateAbsoluteDifference(match),
    }));
    return [...accumulator, ...matches];
  },
  [] as TeamResult[]
);

// Sort the array by the absoluteDifference property in descending order
const sortedMatches = flattenedMatches.sort(
  (a, b) => b.absoluteDifference! - a.absoluteDifference!
);

console.log(sortedMatches);

// Use a set to keep track of unique IDs
const uniqueIds = new Set<string>();

// Filter out duplicates based on the "id" property
const uniqueArray = sortedMatches.filter((item) => {
  if (!uniqueIds.has(item.id)) {
    uniqueIds.add(item.id);
    return true;
  }
  return false;
});

console.log(uniqueArray);

// Save the updated resultByTeam object if needed
const updatedResultByTeamJSON = JSON.stringify(uniqueArray, null, 2);
fs.writeFile(
  "./results/combine.json",
  updatedResultByTeamJSON,
  "utf-8",
  (err) => {
    if (err) {
      console.error("Error wr`iting JSON to file:", err);
    } else {
      console.log("JSON written to file successfully!", "dates");
    }
  }
);
