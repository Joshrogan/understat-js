import * as fs from "fs";
import { TeamResult } from "./dates";
const combined = fs.readFileSync("./results/combine.json", "utf-8");

interface TeamConnection {
  team: string;
  cost: number;
}

interface Graph {
  [teamId: string]: TeamConnection[];
}

const matches = JSON.parse(combined) as TeamResult[];

const isGameWeek24 = (matchDate: Date) =>
  matchDate > new Date("2024-02-10T00:00:00") &&
  matchDate < new Date("2024-02-13T00:00:00");

const isGameWeek25 = (matchDate: Date) =>
  matchDate > new Date("2024-02-17T00:00:00") &&
  matchDate < new Date("2024-02-21T00:00:00");

const isGameWeek26 = (matchDate: Date) =>
  matchDate > new Date("2024-02-24T00:00:00") &&
  matchDate < new Date("2024-02-27T00:00:00");

const isGameWeek27 = (matchDate: Date) =>
  matchDate > new Date("2024-03-02T00:00:00") &&
  matchDate < new Date("2024-03-05T00:00:00");

const isGameWeek28 = (matchDate: Date) =>
  matchDate > new Date("2024-03-08T00:00:00") &&
  matchDate < new Date("2024-03-10T00:00:00");

// Filter matches for each game week
// const gameWeek24Matches = matches.filter(
//   (match) =>
//     isGameWeek24(new Date(match!.datetime)) && match?.absoluteDifference! > 0.5
// );
// const gameWeek25Matches = matches.filter(
//   (match) =>
//     isGameWeek25(new Date(match!.datetime)) && match?.absoluteDifference! > 0.5
// );
// const gameWeek26Matches = matches.filter(
//   (match) =>
//     isGameWeek26(new Date(match!.datetime)) && match?.absoluteDifference! > 0.5
// );
// const gameWeek27Matches = matches.filter(
//   (match) =>
//     isGameWeek27(new Date(match!.datetime)) && match?.absoluteDifference! > 0.5
// );

// const gameWeek28Matches = matches.filter(
//   (match) =>
//     isGameWeek28(new Date(match!.datetime)) && match?.absoluteDifference! > 0.5
// );

const graph: Graph = {};

matches.forEach((match) => {
  const homeTeam = match.h;
  const awayTeam = match.a;

  if (!graph[homeTeam.id]) graph[homeTeam.id] = new Array<TeamConnection>();
  if (!graph[awayTeam.id]) graph[awayTeam.id] = new Array<TeamConnection>();

  const homeTeamId = homeTeam.id;
  if (graph && homeTeamId && typeof graph[homeTeam.id] === "object") {
    let test = graph[homeTeam.id];
    if (test !== undefined) {
      test.push({
        team: awayTeam.id,
        cost: match.absoluteDifference!,
      });
    }
  }

  const awayTeamId = awayTeam.id;
  if (graph && awayTeamId && typeof graph[awayTeam.id] === "object") {
    let test = graph[awayTeam.id];
    if (test !== undefined) {
      test.push({
        team: awayTeam.id,
        cost: match.absoluteDifference!,
      });
    }
  }
});
console.log(graph);

function findHighestCostPath(
  graph: Graph,
  startTeam: string,
  visitedTeams: Set<string>,
  currentCost: number,
  isGameWeek: (matchDate: Date) => boolean
): number {
  visitedTeams.add(startTeam);

  const neighbors = graph[startTeam];

  let maxCost = currentCost;

  for (const neighbor of neighbors!) {
    if (!visitedTeams.has(neighbor.team)) {
      const newPathCost = findHighestCostPath(
        graph,
        neighbor.team,
        new Set(visitedTeams),
        currentCost + neighbor.cost,
        isGameWeek
      );
      maxCost = Math.max(maxCost, newPathCost);
    }
  }

  visitedTeams.delete(startTeam); // Backtrack: remove the current team from the visited set

  return maxCost;
}

// Main function to find the highest cost path for each game week
function findHighestCostPathForEachGameWeek(
  graph: Graph,
  isGameWeek: (matchDate: Date) => boolean
): number {
  let maxCost = 0;

  for (const startTeamId in graph) {
    const cost = findHighestCostPath(
      graph,
      startTeamId,
      new Set<string>(),
      0,
      isGameWeek
    );
    maxCost = Math.max(maxCost, cost);
  }

  return maxCost;
}

// Find the highest cost path for each game week
// const maxCostGameWeek24 = findHighestCostPathForEachGameWeek(
//   graph,
//   isGameWeek24
// );
// const maxCostGameWeek25 = findHighestCostPathForEachGameWeek(
//   graph,`
//   isGameWeek25
// );
// const maxCostGameWeek26 = findHighestCostPathForEachGameWeek(
//   graph,
//   isGameWeek26
// );
// const maxCostGameWeek27 = findHighestCostPathForEachGameWeek(
//   graph,
//   isGameWeek27
// );
// const maxCostGameWeek28 = findHighestCostPathForEachGameWeek(
//   graph,
//   isGameWeek28
// );

// Display the results
// console.log("Max Cost Game Week 24:", maxCostGameWeek24);
console.log("graph:", graph);
// console.log("Max Cost Game Week 26:", maxCostGameWeek26);
// console.log("Max Cost Game Week 27:", maxCostGameWeek27);
// console.log("Max Cost Game Week 28:", maxCostGameWeek28);
