import { describe, expect, it } from "vitest";

import {
  appendSeatRow,
  appendShape,
  buildDemoSeatMap,
  listSeatIds,
  removeSeatMapElement,
} from "./seatmap";

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

  it("adds a straight row with stable seat ids and pricing metadata", () => {
    const map = appendSeatRow(
      {
        version: 1,
        name: "Empty",
        viewport: { width: 600, height: 400 },
        elements: [],
      },
      {
        idPrefix: "hall",
        label: "A",
        seatCount: 4,
        category: "standard",
        price: 1200,
        x: 100,
        y: 150,
        seatSpacing: 28,
      },
    );

    expect(map.elements).toHaveLength(1);
    expect(listSeatIds(map)).toEqual([
      "hall-a-1",
      "hall-a-2",
      "hall-a-3",
      "hall-a-4",
    ]);
    expect(map.elements[0]).toMatchObject({
      id: "hall-row-a",
      kind: "row",
      label: "A",
      x: 100,
      y: 150,
    });
  });

  it("adds shapes and removes elements without mutating the original map", () => {
    const original = buildDemoSeatMap();
    const withShape = appendShape(original, {
      id: "custom-stage",
      label: "Main Stage",
      shape: "stage",
      x: 200,
      y: 40,
      width: 180,
      height: 60,
    });
    const withoutShape = removeSeatMapElement(withShape, "custom-stage");

    expect(original.elements.some((element) => element.id === "custom-stage")).toBe(false);
    expect(withShape.elements.some((element) => element.id === "custom-stage")).toBe(true);
    expect(withoutShape.elements.some((element) => element.id === "custom-stage")).toBe(false);
  });
});
