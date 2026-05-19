import Link from "next/link";

import { SeatMapVariantList } from "@/components/seatmap/SeatMapVariantList";
import {
  toSeatMapListItems,
  toUnassignedEvents,
  type SeatMapListEvent,
  type SeatMapListVenue,
} from "@/lib/seatmap/list-items";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type VenueWithHalls = SeatMapListVenue;

export default async function VenuesPage() {
  const { supabase } = await requireAuthenticatedUser();
  const { data: venues, error } = await supabase
    .from("venues")
    .select("id,name,halls(id,name,is_published,events(id,title,starts_at),seat_maps(map_json))")
    .order("created_at", { ascending: false })
    .returns<VenueWithHalls[]>();
  const { data: detachedEvents, error: detachedEventsError } = await supabase
    .from("events")
    .select("id,title,starts_at")
    .is("hall_id", null)
    .order("created_at", { ascending: false })
    .returns<SeatMapListEvent[]>();
  const variants = toSeatMapListItems(venues);
  const unassignedEvents = toUnassignedEvents(detachedEvents);

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-8">
      <section className="mx-auto max-w-6xl">
        <Link className="text-sm text-zinc-600" href="/dashboard">
          ← Назад в админку
        </Link>
        <div className="mt-6 rounded-4xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
                Схемы
              </p>
              <h1 className="mt-2 text-4xl font-bold text-zinc-950">
                Варианты схем залов
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                Здесь создаются базовые варианты рассадки. В этом слое
                редактируется только геометрия: ряды, места, сцена и подписи.
                Категории и цены относятся к будущему сценарию настройки события.
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
              Не удалось загрузить варианты схем: {error.message}
            </div>
          ) : null}
          {detachedEventsError ? (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
              Не удалось загрузить отвязанные события:{" "}
              {detachedEventsError.message}
            </div>
          ) : null}

          <div className="mt-8">
            <SeatMapVariantList
              variants={variants}
              unassignedEvents={unassignedEvents}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
