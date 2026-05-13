import { describe, expect, it } from "vitest";

import {
  appendSeatRow,
  appendShape,
  buildDemoSeatMap,
  listSeatIds,
  removeSeatMapElement,
  updateSeatMapElement,
  updateSeatMapMetadata,
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

  it("preserves draft map names with spaces and empty values while editing", () => {
    const map = buildDemoSeatMap();

    const renamed = updateSeatMapMetadata(map, {
      name: "Концертный зал",
      width: map.viewport.width,
      height: map.viewport.height,
    });
    const cleared = updateSeatMapMetadata(renamed, {
      name: "",
      width: renamed.viewport.width,
      height: renamed.viewport.height,
    });

    expect(renamed.name).toBe("Концертный зал");
    expect(cleared.name).toBe("");
  });

  it("updates element position, rotation, and shape size without mutating the original map", () => {
    const original = buildDemoSeatMap();
    const updated = updateSeatMapElement(original, "demo-stage", {
      x: 320,
      y: 72,
      rotation: 15,
      width: 240,
      height: 64,
    });

    expect(original.elements[0]).toMatchObject({
      x: 280,
      y: 48,
      rotation: 0,
      width: 200,
      height: 56,
    });
    expect(updated.elements[0]).toMatchObject({
      x: 320,
      y: 72,
      rotation: 15,
      width: 240,
      height: 64,
    });
  });

  it("updates element labels without regenerating row seat ids", () => {
    const original = buildDemoSeatMap();
    const updated = updateSeatMapElement(original, "demo-row-a", {
      label: "Партер центр",
    });

    expect(updated.elements[1]).toMatchObject({
      id: "demo-row-a",
      label: "Партер центр",
    });
    expect(listSeatIds(updated).slice(0, 4)).toEqual([
      "demo-a-1",
      "demo-a-2",
      "demo-a-3",
      "demo-a-4",
    ]);
    expect(original.elements[1]).toMatchObject({
      id: "demo-row-a",
      label: "A",
    });
  });
});
