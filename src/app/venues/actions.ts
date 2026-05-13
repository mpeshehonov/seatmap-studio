"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildDemoSeatMap } from "@/lib/seatmap/seatmap";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";
import { type Json } from "@/lib/supabase/database.types";

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value.trim();
}

export async function createVenue(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser();
  const name = getRequiredString(formData, "name");
  const address = formData.get("address");

  const { error } = await supabase.from("venues").insert({
    owner_id: user.id,
    name,
    address:
      typeof address === "string" && address.trim().length > 0
        ? address.trim()
        : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/venues");
}

export async function createHallWithDemoMap(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser();
  const venueId = getRequiredString(formData, "venueId");
  const name = getRequiredString(formData, "name");

  const { data: hall, error: hallError } = await supabase
    .from("halls")
    .insert({
      owner_id: user.id,
      venue_id: venueId,
      name,
      is_published: false,
    })
    .select("id")
    .single();

  if (hallError) {
    throw new Error(hallError.message);
  }

  const { error: mapError } = await supabase.from("seat_maps").insert({
    owner_id: user.id,
    hall_id: hall.id,
    map_json: buildDemoSeatMap() as unknown as Json,
  });

  if (mapError) {
    throw new Error(mapError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/venues");
  redirect(`/halls/${hall.id}/editor`);
}

export async function setHallPublished(formData: FormData) {
  const { supabase } = await requireAuthenticatedUser();
  const hallId = getRequiredString(formData, "hallId");
  const isPublished = formData.get("isPublished") === "true";

  const { error } = await supabase
    .from("halls")
    .update({ is_published: isPublished })
    .eq("id", hallId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/venues");
  revalidatePath(`/halls/${hallId}/editor`);
  revalidatePath(`/embed/${hallId}`);
}
