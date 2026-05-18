import { describe, expect, it } from "vitest";

import { buildDemoSeatMap } from "./seatmap";
import { toSeatMapListItems } from "./list-items";

describe("seat map list items", () => {
  it("flattens halls with events and one-to-one seat map payloads", () => {
    const map = buildDemoSeatMap();
    const items = toSeatMapListItems([
      {
        id: "workspace",
        name: "Workspace",
        halls: [
          {
            id: "hall-1",
            name: "Основная схема",
            is_published: true,
            events: [
              {
                id: "event-late",
                title: "Поздний концерт",
                starts_at: "2026-06-02T19:00:00.000Z",
              },
              {
                id: "event-early",
                title: "Ранний концерт",
                starts_at: "2026-06-01T19:00:00.000Z",
              },
            ],
            seat_maps: { map_json: map },
          },
        ],
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "hall-1",
      name: "Основная схема",
      isPublished: true,
      events: [
        { id: "event-early", title: "Ранний концерт" },
        { id: "event-late", title: "Поздний концерт" },
      ],
    });
    expect(items[0]?.map?.name).toBe(map.name);
  });

  it("supports Supabase array payloads for nested seat maps", () => {
    const map = buildDemoSeatMap();
    const items = toSeatMapListItems([
      {
        id: "workspace",
        name: "Workspace",
        halls: [
          {
            id: "hall-1",
            name: "Основная схема",
            is_published: false,
            events: null,
            seat_maps: [{ map_json: map }],
          },
        ],
      },
    ]);

    expect(items[0]?.map?.viewport.width).toBe(760);
    expect(items[0]?.events).toEqual([]);
  });
});
