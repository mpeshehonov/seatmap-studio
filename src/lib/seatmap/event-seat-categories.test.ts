import { describe, expect, it } from "vitest";

import {
  EVENT_SEAT_CATEGORY_OPTIONS,
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

  it("keeps the MVP category list explicit and ordered", () => {
    expect(EVENT_SEAT_CATEGORY_OPTIONS.map((option) => option.value)).toEqual([
      "standard",
      "vip",
      "accessible",
    ]);
  });
});
