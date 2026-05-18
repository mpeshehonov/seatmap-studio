import { type SeatMapJson } from "./seatmap";

export type SeatMapListEvent = {
  id: string;
  title: string;
  starts_at: string | null;
};

export type SeatMapListHall = {
  id: string;
  name: string;
  is_published: boolean;
  events: SeatMapListEvent[] | null;
  seat_maps:
    | { map_json: unknown }
    | { map_json: unknown }[]
    | null;
};

export type SeatMapListVenue = {
  id: string;
  name: string;
  halls: SeatMapListHall[] | null;
};

export type SeatMapListItem = {
  id: string;
  name: string;
  isPublished: boolean;
  events: SeatMapListEvent[];
  map: SeatMapJson | null;
};

export function toSeatMapListItems(
  venues: SeatMapListVenue[] | null | undefined,
): SeatMapListItem[] {
  return (venues ?? []).flatMap((venue) =>
    (venue.halls ?? []).map((hall) => ({
      id: hall.id,
      name: hall.name,
      isPublished: hall.is_published,
      events: [...(hall.events ?? [])].sort(compareEventsByDate),
      map: extractSeatMap(hall.seat_maps),
    })),
  );
}

function extractSeatMap(
  payload: SeatMapListHall["seat_maps"],
): SeatMapJson | null {
  const mapPayload = Array.isArray(payload) ? payload[0] : payload;

  if (!mapPayload?.map_json) {
    return null;
  }

  return mapPayload.map_json as SeatMapJson;
}

function compareEventsByDate(
  first: SeatMapListEvent,
  second: SeatMapListEvent,
): number {
  if (!first.starts_at && !second.starts_at) {
    return first.title.localeCompare(second.title);
  }

  if (!first.starts_at) {
    return 1;
  }

  if (!second.starts_at) {
    return -1;
  }

  return first.starts_at.localeCompare(second.starts_at);
}
