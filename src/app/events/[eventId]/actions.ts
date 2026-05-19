"use server";

import { revalidatePath } from "next/cache";

import {
  EVENT_SEAT_CATEGORY_OPTIONS,
  type EventSeatCategory,
} from "@/lib/seatmap/event-seat-categories";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type AssignEventSeatCategoryResult = {
  ok: true;
  count: number;
};

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value.trim();
}

export async function assignEventSeatCategory(
  formData: FormData,
): Promise<AssignEventSeatCategoryResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  const eventId = getRequiredString(formData, "eventId");
  const hallId = getRequiredString(formData, "hallId");
  const category = parseCategory(getRequiredString(formData, "category"));
  const seatIds = parseSeatIds(getRequiredString(formData, "seatIds"));

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,hall_id")
    .eq("id", eventId)
    .single();

  if (eventError) {
    throw new Error(eventError.message);
  }

  if (!event.hall_id) {
    throw new Error("Событие нужно привязать к схеме перед настройкой мест.");
  }

  if (event.hall_id !== hallId) {
    throw new Error("Событие привязано к другой схеме.");
  }

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

function parseCategory(value: string): EventSeatCategory {
  const categories = EVENT_SEAT_CATEGORY_OPTIONS.map((option) => option.value);

  if (!categories.includes(value as EventSeatCategory)) {
    throw new Error("Некорректная категория места.");
  }

  return value as EventSeatCategory;
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
