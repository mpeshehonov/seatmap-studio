import {
  DEFAULT_EVENT_SEAT_CATEGORY_DEFINITIONS,
  type EventSeatCategoryDefinition,
  toEventSeatCategoryDefinitions,
} from "@/lib/seatmap/event-seat-categories";
import { type SupabaseClient } from "@supabase/supabase-js";
import { type Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function ensureEventSeatCategoryDefinitions(
  supabase: Supabase,
  eventId: string,
  ownerId: string,
): Promise<EventSeatCategoryDefinition[]> {
  const { data: existing, error: existingError } = await supabase
    .from("event_seat_category_definitions")
    .select("key,name,description,color_token,sort_order")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing && existing.length > 0) {
    return toEventSeatCategoryDefinitions(existing);
  }

  const { error: insertError } = await supabase
    .from("event_seat_category_definitions")
    .insert(
      DEFAULT_EVENT_SEAT_CATEGORY_DEFINITIONS.map((definition) => ({
        event_id: eventId,
        owner_id: ownerId,
        key: definition.key,
        name: definition.name,
        color_token: definition.colorToken,
        sort_order: definition.sortOrder,
      })),
    );

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { data: seeded, error: seededError } = await supabase
    .from("event_seat_category_definitions")
    .select("key,name,description,color_token,sort_order")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (seededError) {
    throw new Error(seededError.message);
  }

  return toEventSeatCategoryDefinitions(seeded);
}
