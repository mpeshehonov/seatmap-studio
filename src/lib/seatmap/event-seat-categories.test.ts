import { describe, expect, it } from "vitest";

import {
  createCategoryKey,
  DEFAULT_EVENT_SEAT_CATEGORY_DEFINITIONS,
  getEventSeatCategoryClassName,
  pickNextCategoryColorToken,
  toEventSeatCategoryDefinitions,
  toEventSeatCategoryMap,
} from "./event-seat-categories";

describe("event seat categories", () => {
  it("normalizes persisted event categories into a seat lookup", () => {
    expect(
      toEventSeatCategoryMap([
        { seat_id: "a-1", category: "standard" },
        { seat_id: "a-2", category: "vip" },
        { seat_id: "a-3", category: "accessible" },
      ]),
    ).toEqual({
      "a-1": "standard",
      "a-2": "vip",
      "a-3": "accessible",
    });
  });

  it("ships default definitions without descriptions", () => {
    expect(DEFAULT_EVENT_SEAT_CATEGORY_DEFINITIONS).toEqual([
      { key: "standard", name: "Стандарт", colorToken: "sky", sortOrder: 0 },
      { key: "vip", name: "VIP", colorToken: "amber", sortOrder: 1 },
      {
        key: "accessible",
        name: "Доступные места",
        colorToken: "emerald",
        sortOrder: 2,
      },
    ]);
  });

  it("maps definition rows from the database", () => {
    expect(
      toEventSeatCategoryDefinitions([
        {
          key: "vip",
          name: "VIP",
          description: null,
          color_token: "amber",
          sort_order: 1,
        },
        {
          key: "standard",
          name: "Стандарт",
          description: null,
          color_token: "sky",
          sort_order: 0,
        },
      ]),
    ).toEqual([
      {
        key: "standard",
        name: "Стандарт",
        description: null,
        colorToken: "sky",
        sortOrder: 0,
      },
      {
        key: "vip",
        name: "VIP",
        description: null,
        colorToken: "amber",
        sortOrder: 1,
      },
    ]);
  });

  it("creates unique keys for custom categories", () => {
    expect(createCategoryKey("Партер", [])).toMatch(/^category$/);
    expect(createCategoryKey("Parter", ["parter"])).toBe("parter_2");
  });

  it("picks the next unused color token", () => {
    expect(
      pickNextCategoryColorToken([
        { colorToken: "sky" },
        { colorToken: "amber" },
      ]),
    ).toBe("emerald");
  });

  it("falls back to a neutral seat style for unknown tokens", () => {
    expect(getEventSeatCategoryClassName("unknown")).toContain("zinc");
  });
});
