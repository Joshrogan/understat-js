import { load } from "cheerio";
import * as fs from "fs";

interface HistoryEntry {
  xpts: number;
  // Add other properties if necessary
}

export interface TeamData {
  id: string;
  title: string;
  avgLast6Xpts?: number;
  history?: HistoryEntry[];
}

export interface DatesData {
  isResult: boolean;
  h: { id: string; title: string; short_title: string; avgLast6Xpts?: number };
  a: { id: string; title: string; short_title: string; avgLast6Xpts?: number };
  avgLast6Xpts?: number;
}

export interface TeamResult {
  id: string;
  isResult?: boolean;
  h: { id: string; title: string; short_title: string; avgLast6Xpts?: number };
  a: { id: string; title: string; short_title: string; avgLast6Xpts?: number };
  goals?: { h: string; a: string };
  xG?: { h: string; a: string };
  datetime: string;
  forecast?: { w: string; d: string; l: string };
  avgLast6Xpts?: number;
  absoluteDifference?: number;
}

export interface ResultByTeam {
  [teamTitle: string]: TeamResult[];
}

const getAPI = async () => {
  const res = await fetch("https://understat.com/league/EPL");
  // "statData","teamsData","playersData","datesData","shotsData","minMaxPlayerStats","groupsData","statisticsData","rostersData"
  const dataType = "datesData";
  const pattern = new RegExp(
    `${dataType}\\s+=\\s+JSON\\.parse\\('(.*?)'\\)`,
    "g"
  );
  if (res.ok) {
    const data = await res.text();

    const $ = load(data);
    const scriptTags = $("script");

    const test = scriptTags.contents();
    const filePath = "./results/dates.json";
    let result: TeamResult[] = [];
    test.each((index, element) => {
      if (element.type === "text") {
        const match = pattern.exec(element.data);
        if (match && match[1]) {
          const hexData = match[1].replace(/\\x([0-9A-Fa-f]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          );
          const jsonData = JSON.parse(hexData);
          result = jsonData;
        }
      }
    });
    const resultByTeam: ResultByTeam = {};

    if (result.length) {
      const filteredData = result.filter((item) => item.isResult !== true);

      filteredData.forEach((item) => {
        // Add to h.title
        if (!resultByTeam[item.h.title]) {
          resultByTeam[item.h.title] = [];
        }
        if (resultByTeam[item.h.title]) {
          resultByTeam[item.h.title]!.push(item);
        }

        // Add to a.title
        if (!resultByTeam[item.a.title]) {
          resultByTeam[item.a.title] = [];
        }
        if (resultByTeam[item.a.title]) {
          resultByTeam[item.a.title]!.push(item);
        }
      });
    }

    Object.keys(resultByTeam).forEach((key) => {
      resultByTeam[key] = resultByTeam[key]!.slice(0, 3);
    });
    console.log(resultByTeam);

    Object.keys(resultByTeam).forEach((key) => {
      resultByTeam[key] = resultByTeam[key]!.map((item) => {
        const { xG, goals, forecast, isResult, ...rest } = item;
        return rest;
      });
    });

    const jsonString = JSON.stringify(resultByTeam, null, 2);

    fs.writeFile(filePath, jsonString, "utf-8", (err) => {
      if (err) {
        console.error("Error wr`iting JSON to file:", err);
      } else {
        console.log("JSON written to file successfully!", "dates");
      }
    });

    // const newData: Record<
    //   string,
    //   {
    //     id: string;
    //     history: HistoryEntry[];
    //     avgLast6Xpts?: number;
    //     title: string;
    //   }
    // > = {};

    // for (const [key, teamData] of Object.entries(result)) {
    //   const title: string = teamData.title;
    //   const { history, id } = teamData;

    //   newData[title] = { id, history, title };

    //   const last6Xpts = history
    //     .slice(-6)
    //     .map((entry: HistoryEntry) => entry.xpts || 0);
    //   const avgLast6Xpts =
    //     last6Xpts.length > 0
    //       ? last6Xpts.reduce((sum: number, x: number) => sum + x, 0) /
    //         last6Xpts.length
    //       : undefined;

    //   newData[teamData.title] = { id, avgLast6Xpts, history, title };
    // }

    // // Create an array of objects from newData
    // const dataArray: TeamData[] = Object.values(newData);

    // // Sort the array based on avgLast6Xpts in descending order
    // dataArray.forEach((team) => delete team.history);

    // // Sort the array based on avgLast6Xpts in descending order
    // dataArray.sort((a, b) => (b.avgLast6Xpts || 0) - (a.avgLast6Xpts || 0));

    // const jsonString = JSON.stringify(dataArray, null, 2);

    // fs.writeFile(filePath, jsonString, "utf-8", (err) => {
    //   if (err) {
    //     console.error("Error wr`iting JSON to file:", err);
    //   } else {
    //     console.log(
    //       "JSON written to file successfully!",
    //       dataArray?.length,
    //       "teams"
    //     );
    //   }
    // });
  }
};

getAPI();
