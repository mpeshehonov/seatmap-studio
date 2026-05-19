"use server";

import { revalidatePath } from "next/cache";

import { ensureEventSeatCategoryDefinitions } from "@/lib/seatmap/ensure-event-seat-category-definitions";
import {
  createCategoryKey,
  pickNextCategoryColorToken,
  type EventSeatCategoryDefinition,
  type EventSeatCategoryKey,
} from "@/lib/seatmap/event-seat-categories";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type AssignEventSeatCategoryResult = {
  ok: true;
  count: number;
};

type CreateEventSeatCategoryDefinitionResult = {
  ok: true;
  definition: EventSeatCategoryDefinition;
};

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value.trim();
}

function getOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function requireOwnedEvent(
  eventId: string,
  hallId?: string,
) {
  const { supabase, user } = await requireAuthenticatedUser();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,hall_id,owner_id")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    throw new Error("Событие не найдено.");
  }

  if (event.owner_id !== user.id) {
    throw new Error("Нет доступа к событию.");
  }

  if (!event.hall_id) {
    throw new Error("Событие нужно привязать к схеме перед настройкой мест.");
  }

  if (hallId && event.hall_id !== hallId) {
    throw new Error("Событие привязано к другой схеме.");
  }

  return { supabase, user, event };
}

export async function assignEventSeatCategory(
  formData: FormData,
): Promise<AssignEventSeatCategoryResult> {
  const eventId = getRequiredString(formData, "eventId");
  const hallId = getRequiredString(formData, "hallId");
  const category = getRequiredString(formData, "category");
  const seatIds = parseSeatIds(getRequiredString(formData, "seatIds"));
  const { supabase, user } = await requireOwnedEvent(eventId, hallId);

  await assertCategoryExists(supabase, eventId, category);

  const { error } = await supabase.from("event_seat_categories").upsert(
    seatIds.map((seatId) => ({
      owner_id: user.id,
      event_id: eventId,
      hall_id: hallId,
      seat_id: seatId,
      category,
    })),
    { onConflict: "event_id,seat_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/events/${eventId}`);

  return { ok: true, count: seatIds.length };
}

export async function createEventSeatCategoryDefinition(
  formData: FormData,
): Promise<CreateEventSeatCategoryDefinitionResult> {
  const eventId = getRequiredString(formData, "eventId");
  const name = getRequiredString(formData, "name");
  const description = getOptionalString(formData, "description");
  const { supabase, user } = await requireOwnedEvent(eventId);

  const definitions = await ensureEventSeatCategoryDefinitions(
    supabase,
    eventId,
    user.id,
  );
  const key = createCategoryKey(
    name,
    definitions.map((definition) => definition.key),
  );
  const colorToken = pickNextCategoryColorToken(definitions);
  const sortOrder =
    definitions.reduce(
      (maxOrder, definition) => Math.max(maxOrder, definition.sortOrder),
      -1,
    ) + 1;

  const { data, error } = await supabase
    .from("event_seat_category_definitions")
    .insert({
      event_id: eventId,
      owner_id: user.id,
      key,
      name,
      description,
      color_token: colorToken,
      sort_order: sortOrder,
    })
    .select("key,name,description,color_token,sort_order")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Не удалось создать категорию.");
  }

  revalidatePath(`/events/${eventId}`);

  return {
    ok: true,
    definition: {
      key: data.key,
      name: data.name,
      description: data.description,
      colorToken: data.color_token,
      sortOrder: data.sort_order,
    },
  };
}

async function assertCategoryExists(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  eventId: string,
  category: EventSeatCategoryKey,
) {
  const { data, error } = await supabase
    .from("event_seat_category_definitions")
    .select("key")
    .eq("event_id", eventId)
    .eq("key", category)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Категория не найдена для этого события.");
  }
}

function parseSeatIds(value: string): string[] {
  const parsedValue: unknown = JSON.parse(value);

  if (!Array.isArray(parsedValue)) {
    throw new Error("Некорректный список мест.");
  }

  const seatIds = parsedValue.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );

  if (seatIds.length === 0) {
    throw new Error("Выберите хотя бы одно место.");
  }

  return [...new Set(seatIds)];
}
