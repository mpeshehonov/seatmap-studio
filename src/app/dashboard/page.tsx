import { SeatMapVariantList } from "@/components/seatmap/SeatMapVariantList";
import {
  toSeatMapListItems,
  toUnassignedEvents,
  type SeatMapListEvent,
  type SeatMapListVenue,
} from "@/lib/seatmap/list-items";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type VenueSummary = SeatMapListVenue;

export default async function DashboardPage() {
  const { supabase, user } = await requireAuthenticatedUser();
  const { data: venues, error } = await supabase
    .from("venues")
    .select("id,name,halls(id,name,is_published,events(id,title,starts_at),seat_maps(map_json))")
    .order("created_at", { ascending: false })
    .returns<VenueSummary[]>();
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
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
              Админка
            </p>
            <h1 className="mt-2 text-4xl font-bold text-zinc-950">
              Варианты схем залов
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Аккаунт: {user.email ?? user.id}
            </p>
          </div>
        </header>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900">
            Не удалось загрузить варианты схем: {error.message}
          </div>
        ) : null}

        {detachedEventsError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900">
            Не удалось загрузить отвязанные события: {detachedEventsError.message}
          </div>
        ) : null}

        <SeatMapVariantList
          variants={variants}
          unassignedEvents={unassignedEvents}
        />
      </section>
    </main>
  );
}
