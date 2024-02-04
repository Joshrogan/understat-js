import { load } from "cheerio";
import * as fs from "fs";

interface HistoryEntry {
  xpts: number;
  // Add other properties if necessary
}

interface TeamData {
  id: string;
  title: string;
  avgLast6Xpts?: number;
  history?: HistoryEntry[];
}

const getAPI = async () => {
  const res = await fetch("https://understat.com/league/EPL");
  // "statData","teamsData","playersData","datesData","shotsData","minMaxPlayerStats","groupsData","statisticsData","rostersData"
  const dataType = "teamsData";
  const pattern = new RegExp(
    `${dataType}\\s+=\\s+JSON\\.parse\\('(.*?)'\\)`,
    "g"
  );
  if (res.ok) {
    const data = await res.text();

    const $ = load(data);
    const scriptTags = $("script");

    const test = scriptTags.contents();
    const filePath = "./results/data.json";
    let result: Object = {};
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

    const newData: Record<
      string,
      {
        id: string;
        history: HistoryEntry[];
        avgLast6Xpts?: number;
        title: string;
      }
    > = {};

    for (const [key, teamData] of Object.entries(result)) {
      const title: string = teamData.title;
      const { history, id } = teamData;

      newData[title] = { id, history, title };

      const last6Xpts = history
        .slice(-6)
        .map((entry: HistoryEntry) => entry.xpts || 0);
      const avgLast6Xpts =
        last6Xpts.length > 0
          ? last6Xpts.reduce((sum: number, x: number) => sum + x, 0) /
            last6Xpts.length
          : undefined;

      newData[teamData.title] = { id, avgLast6Xpts, history, title };
    }

    // Create an array of objects from newData
    const dataArray: TeamData[] = Object.values(newData);

    // Sort the array based on avgLast6Xpts in descending order
    dataArray.forEach((team) => delete team.history);

    // Sort the array based on avgLast6Xpts in descending order
    dataArray.sort((a, b) => (b.avgLast6Xpts || 0) - (a.avgLast6Xpts || 0));

    const jsonString = JSON.stringify(dataArray, null, 2);

    fs.writeFile(filePath, jsonString, "utf-8", (err) => {
      if (err) {
        console.error("Error wr`iting JSON to file:", err);
      } else {
        console.log(
          "JSON written to file successfully!",
          dataArray?.length,
          "teams"
        );
      }
    });
  }
};

getAPI();
