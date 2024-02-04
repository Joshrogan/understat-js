0. get last 6 games worth of xPoints data. `ts-node ./src/index.ts`

```
// index.ts
const last6Xpts = history.slice(-6)
```

1. get 6 next games per team `ts-node ./src/dates.ts`

```
// dates.ts
Object.keys(resultByTeam).forEach((key) => {
    resultByTeam[key] = resultByTeam[key]!.slice(0, 6);
});
```

2. combine these things `ts-node ./src/combine.ts`

3. open bestFixtures.html to see the best fixtures

```
const matches = data.filter((item) => {
  const matchDate = new Date(item.datetime);

  const gameWeek24 =
     matchDate > new Date("2024-02-10T00:00:00") &&
      matchDate < new Date("2024-02-13T00:00:00");
  return gameWeek24 && item.absoluteDifference >= 0.5;
```

only showing the most one sided games.

change the amount of games per team for past points or future fixtures then combine again.

![example](<Screenshot 2024-02-04 at 14.47.48.png>)

also console logs the results in of the graph too.
