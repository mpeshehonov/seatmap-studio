import Link from "next/link";

import {
  createHallWithDemoMap,
  createVenue,
  setHallPublished,
} from "@/app/venues/actions";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type HallSummary = {
  id: string;
  name: string;
  is_published: boolean;
};

type VenueWithHalls = {
  id: string;
  name: string;
  address: string | null;
  halls: HallSummary[] | null;
};

export default async function VenuesPage() {
  const { supabase } = await requireAuthenticatedUser();
  const { data: venues, error } = await supabase
    .from("venues")
    .select("id,name,address,halls(id,name,is_published)")
    .order("created_at", { ascending: false })
    .returns<VenueWithHalls[]>();

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-8">
      <section className="mx-auto max-w-6xl">
        <Link className="text-sm text-zinc-600" href="/dashboard">
          ← Назад в админку
        </Link>
        <div className="mt-6 rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
                Площадки
              </p>
              <h1 className="mt-2 text-4xl font-bold text-zinc-950">
                Управление площадками
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                Здесь создаются площадки и залы. Каждый зал получает свой
                редактор и публичный embed URL после публикации.
              </p>
            </div>
          </div>

          <form action={createVenue} className="mt-8 rounded-3xl bg-zinc-50 p-5">
            <h2 className="text-lg font-bold text-zinc-950">
              Новая площадка
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                required
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-rose-500"
                name="name"
                placeholder="Название площадки"
              />
              <input
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-rose-500"
                name="address"
                placeholder="Адрес, опционально"
              />
              <button
                className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
                type="submit"
              >
                Создать
              </button>
            </div>
          </form>

          {error ? (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
              Не удалось загрузить площадки: {error.message}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-5">
            {(venues ?? []).map((venue) => (
              <div key={venue.id} className="rounded-3xl border border-zinc-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">
                      {venue.address ?? "Адрес не указан"}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-zinc-950">
                      {venue.name}
                    </h2>
                  </div>
                  <form action={createHallWithDemoMap} className="flex gap-2">
                    <input name="venueId" type="hidden" value={venue.id} />
                    <input
                      required
                      className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-rose-500"
                      name="name"
                      placeholder="Название зала"
                    />
                    <button
                      className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                      type="submit"
                    >
                      Добавить зал
                    </button>
                  </form>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {(venue.halls ?? []).map((hall) => (
                    <div
                      key={hall.id}
                      className="rounded-2xl border border-zinc-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-zinc-950">
                            {hall.name}
                          </h3>
                          <p className="mt-1 text-xs text-zinc-500">
                            {hall.is_published
                              ? "Опубликован"
                              : "Черновик"}
                          </p>
                        </div>
                        <form action={setHallPublished}>
                          <input name="hallId" type="hidden" value={hall.id} />
                          <input
                            name="isPublished"
                            type="hidden"
                            value={String(!hall.is_published)}
                          />
                          <button
                            className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                            type="submit"
                          >
                            {hall.is_published ? "Снять" : "Опубликовать"}
                          </button>
                        </form>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                          href={`/halls/${hall.id}/editor`}
                        >
                          Редактор
                        </Link>
                        <Link
                          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900"
                          href={`/embed/${hall.id}`}
                        >
                          Embed
                        </Link>
                        <code className="rounded-full bg-zinc-100 px-4 py-2 text-xs text-zinc-700">
                          /embed/{hall.id}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {(venues ?? []).length === 0 ? (
              <p className="rounded-3xl bg-zinc-50 p-6 text-sm text-zinc-600">
                Площадок пока нет. Создайте первую площадку выше.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
