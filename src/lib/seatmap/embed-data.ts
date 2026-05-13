import { demoHall, demoSeatStatuses } from "@/lib/seatmap/demo-data";
import { type SeatMapJson, type SeatStatus } from "@/lib/seatmap/seatmap";
import { createClient } from "@/lib/supabase/server";

export type EmbedHallPayload = {
  hall: {
    id: string;
    name: string;
    venueName: string | null;
  };
  map: SeatMapJson;
  statuses: Record<string, SeatStatus>;
};

const databaseSeatStatuses = new Set(["available", "held", "sold"]);

export async function getEmbedHallPayload(
  hallId: string,
): Promise<EmbedHallPayload | null> {
  if (hallId === demoHall.id) {
    return {
      hall: {
        id: demoHall.id,
        name: demoHall.name,
        venueName: demoHall.venueName,
      },
      map: demoHall.seatMap,
      statuses: demoSeatStatuses,
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data: hall, error: hallError } = await supabase
    .from("halls")
    .select("id,name,venue_id,is_published")
    .eq("id", hallId)
    .eq("is_published", true)
    .maybeSingle();

  if (hallError || !hall) {
    return null;
  }

  const [{ data: venue }, { data: seatMap }, { data: seatStatuses }] =
    await Promise.all([
      supabase.from("venues").select("name").eq("id", hall.venue_id).maybeSingle(),
      supabase
        .from("seat_maps")
        .select("map_json")
        .eq("hall_id", hall.id)
        .maybeSingle(),
      supabase
        .from("seat_statuses")
        .select("seat_id,status")
        .eq("hall_id", hall.id),
    ]);

  if (!seatMap?.map_json) {
    return null;
  }

  return {
    hall: {
      id: hall.id,
      name: hall.name,
      venueName: venue?.name ?? null,
    },
    map: seatMap.map_json as unknown as SeatMapJson,
    statuses: Object.fromEntries(
      (seatStatuses ?? [])
        .filter((seatStatus) => databaseSeatStatuses.has(seatStatus.status))
        .map((seatStatus) => [
          seatStatus.seat_id,
          seatStatus.status as SeatStatus,
        ]),
    ),
  };
}
