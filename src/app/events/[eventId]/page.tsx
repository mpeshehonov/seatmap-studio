import Link from "next/link";
import { notFound } from "next/navigation";

import { EventSeatCategoryEditor } from "./EventSeatCategoryEditor";
import {
  type EventSeatCategoryAssignment,
  toEventSeatCategoryMap,
} from "@/lib/seatmap/event-seat-categories";
import { type SeatMapJson } from "@/lib/seatmap/seatmap";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type EventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

type EventDetails = {
  id: string;
  title: string;
  starts_at: string | null;
  hall_id: string | null;
};

type HallWithSeatMap = {
  id: string;
  name: string;
  seat_maps:
    | {
        map_json: unknown;
      }
    | {
        map_json: unknown;
      }[]
    | null;
};

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;
  const { supabase } = await requireAuthenticatedUser();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,title,starts_at,hall_id")
    .eq("id", eventId)
    .single()
    .returns<EventDetails>();

  if (eventError || !event) {
    notFound();
  }

  if (!event.hall_id) {
    return (
      <main className="min-h-screen bg-zinc-100 px-6 py-8">
        <section className="mx-auto max-w-5xl rounded-4xl bg-white p-8 shadow-sm">
          <Link className="text-sm text-zinc-600" href="/dashboard">
            ← В админку
          </Link>
          <h1 className="mt-6 text-4xl font-bold text-zinc-950">
            {event.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600">
            Это событие сейчас не привязано к схеме. Привяжите его к схеме в
            списке залов, чтобы настроить категории мест.
          </p>
        </section>
      </main>
    );
  }

  const { data: hall, error: hallError } = await supabase
    .from("halls")
    .select("id,name,seat_maps(map_json)")
    .eq("id", event.hall_id)
    .single()
    .returns<HallWithSeatMap>();

  if (hallError || !hall) {
    notFound();
  }

  const map = extractSeatMap(hall.seat_maps);

  if (!map) {
    notFound();
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("event_seat_categories")
    .select("seat_id,category")
    .eq("event_id", event.id)
    .returns<EventSeatCategoryAssignment[]>();

  if (assignmentsError) {
    throw new Error(assignmentsError.message);
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-4xl bg-white p-8 shadow-sm">
          <Link className="text-sm text-zinc-600" href="/dashboard">
            ← В админку
          </Link>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
                Событие внутри схемы
              </p>
              <h1 className="mt-2 text-4xl font-bold text-zinc-950">
                {event.title}
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Схема:{" "}
                <Link
                  className="font-semibold text-zinc-800 hover:text-rose-600"
                  href={`/halls/${hall.id}/editor`}
                >
                  {hall.name}
                </Link>
              </p>
              {event.starts_at ? (
                <p className="mt-1 text-sm text-zinc-500">
                  Дата: {formatEventDate(event.starts_at)}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <EventSeatCategoryEditor
          eventId={event.id}
          hallId={hall.id}
          map={map}
          initialSeatCategories={toEventSeatCategoryMap(assignments)}
        />
      </section>
    </main>
  );
}

function extractSeatMap(payload: HallWithSeatMap["seat_maps"]): SeatMapJson | null {
  const mapPayload = Array.isArray(payload) ? payload[0] : payload;

  if (!mapPayload?.map_json) {
    return null;
  }

  return mapPayload.map_json as SeatMapJson;
}

function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
