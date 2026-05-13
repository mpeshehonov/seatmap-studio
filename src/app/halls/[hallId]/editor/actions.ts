"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/supabase/auth";
import { type Json } from "@/lib/supabase/database.types";

export type SaveSeatMapResult = {
  ok: boolean;
  message: string;
};

export async function saveSeatMap(formData: FormData): Promise<SaveSeatMapResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  const hallId = formData.get("hallId");
  const mapJson = formData.get("mapJson");

  if (typeof hallId !== "string" || hallId.length === 0) {
    return { ok: false, message: "Не передан id зала." };
  }

  if (typeof mapJson !== "string" || mapJson.length === 0) {
    return { ok: false, message: "Не передана JSON-схема." };
  }

  let parsedMap: Json;

  try {
    parsedMap = JSON.parse(mapJson) as Json;
  } catch {
    return { ok: false, message: "Схема содержит невалидный JSON." };
  }

  const { error } = await supabase.from("seat_maps").upsert(
    {
      owner_id: user.id,
      hall_id: hallId,
      map_json: parsedMap,
    },
    { onConflict: "hall_id" },
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/halls/${hallId}/editor`);
  revalidatePath(`/embed/${hallId}`);

  return { ok: true, message: "Схема сохранена." };
}
