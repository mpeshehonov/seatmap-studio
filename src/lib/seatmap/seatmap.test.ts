import { describe, expect, it } from "vitest";

import { buildDemoSeatMap, listSeatIds } from "./seatmap";

describe("seat map helpers", () => {
  it("builds a demo hall with rows, seats, and a stage shape", () => {
    const map = buildDemoSeatMap();

    expect(map.version).toBe(1);
    expect(map.elements.some((element) => element.kind === "shape")).toBe(true);
    expect(listSeatIds(map)).toHaveLength(52);
  });

  it("keeps generated seat ids stable for widget status lookups", () => {
    const map = buildDemoSeatMap();

    expect(listSeatIds(map).slice(0, 4)).toEqual([
      "demo-a-1",
      "demo-a-2",
      "demo-a-3",
      "demo-a-4",
    ]);
  });
});
