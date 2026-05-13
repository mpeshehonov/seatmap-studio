import Link from "next/link";

import { setHallPublished } from "@/app/venues/actions";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type HallSummary = {
  id: string;
  name: string;
  is_published: boolean;
};

type VenueSummary = {
  id: string;
  name: string;
  address: string | null;
  halls: HallSummary[] | null;
};

export default async function DashboardPage() {
  const { supabase, user } = await requireAuthenticatedUser();
  const { data: venues, error } = await supabase
    .from("venues")
    .select("id,name,address,halls(id,name,is_published)")
    .order("created_at", { ascending: false })
    .returns<VenueSummary[]>();

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
              Админка
            </p>
            <h1 className="mt-2 text-4xl font-bold text-zinc-950">
              Площадки и залы
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Аккаунт: {user.email ?? user.id}
            </p>
          </div>
          <Link
            className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
            href="/venues"
          >
            Управлять площадками
          </Link>
        </header>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900">
            Не удалось загрузить площадки: {error.message}
          </div>
        ) : null}

        {venues && venues.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {venues.map((venue) => (
              <div key={venue.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-zinc-500">
                  {venue.address ?? "Адрес не указан"}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-zinc-950">
                  {venue.name}
                </h2>
                <div className="mt-5 flex flex-col gap-3">
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
                      </div>
                    </div>
                  ))}
                  {(venue.halls ?? []).length === 0 ? (
                    <p className="rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-600">
                      В этой площадке пока нет залов.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-zinc-950">
              Создайте первую площадку
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600">
              После создания площадки можно добавить зал с демо-схемой,
              открыть редактор и опубликовать embed-виджет.
            </p>
            <div className="mt-6">
              <Link
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
                href="/venues"
              >
                Перейти к площадкам
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
