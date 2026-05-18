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
  const submittedVenueId = formData.get("venueId");
  const venueId =
    typeof submittedVenueId === "string" && submittedVenueId.trim().length > 0
      ? submittedVenueId.trim()
      : await getOrCreateWorkspaceVenueId(user.id);
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
  revalidatePath(`/venues/${venueId}`);
  redirect(`/halls/${hall.id}/editor`);
}

export async function createEventForHall(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser();
  const hallId = getRequiredString(formData, "hallId");
  const title = getRequiredString(formData, "title");
  const startsAt = parseOptionalDateTime(formData.get("startsAt"));

  const { error } = await supabase.from("events").insert({
    owner_id: user.id,
    hall_id: hallId,
    title,
    starts_at: startsAt,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/venues");
  revalidatePath(`/halls/${hallId}/editor`);
}

function parseOptionalDateTime(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid event date");
  }

  return date.toISOString();
}

async function getOrCreateWorkspaceVenueId(ownerId: string): Promise<string> {
  const supabase = (await requireAuthenticatedUser()).supabase;
  const { data: existingVenue, error: existingVenueError } = await supabase
    .from("venues")
    .select("id")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingVenueError) {
    throw new Error(existingVenueError.message);
  }

  if (existingVenue?.id) {
    return existingVenue.id;
  }

  const { data: venue, error } = await supabase
    .from("venues")
    .insert({
      owner_id: ownerId,
      name: "Рабочая область схем",
      address: null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return venue.id;
}

export async function setHallPublished(formData: FormData) {
  const { supabase } = await requireAuthenticatedUser();
  const hallId = getRequiredString(formData, "hallId");
  const isPublished = formData.get("isPublished") === "true";

  const { data: hall, error } = await supabase
    .from("halls")
    .update({ is_published: isPublished })
    .eq("id", hallId)
    .select("venue_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/venues");
  if (hall?.venue_id) {
    revalidatePath(`/venues/${hall.venue_id}`);
  }
  revalidatePath(`/halls/${hallId}/editor`);
  revalidatePath(`/embed/${hallId}`);
}
