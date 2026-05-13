import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createHallWithDemoMap,
  setHallPublished,
} from "@/app/venues/actions";
import {
  AddIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  ExternalLinkIcon,
  WidgetIcon,
} from "@/components/ui/icons";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type VenuePageProps = {
  params: Promise<{
    venueId: string;
  }>;
};

type VenueDetails = {
  id: string;
  name: string;
  address: string | null;
  halls: {
    id: string;
    name: string;
    is_published: boolean;
  }[] | null;
};

export default async function VenuePage({ params }: VenuePageProps) {
  const { venueId } = await params;
  const { supabase } = await requireAuthenticatedUser();
  const { data: venue, error } = await supabase
    .from("venues")
    .select("id,name,address,halls(id,name,is_published)")
    .eq("id", venueId)
    .single()
    .returns<VenueDetails>();

  if (error || !venue) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap gap-3">
          <Link className="text-sm text-zinc-600" href="/dashboard">
            ← В дашборд
          </Link>
          <Link className="text-sm text-zinc-600" href="/venues">
            Все площадки
          </Link>
        </div>

        <div className="mt-6 rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
                Площадка
              </p>
              <h1 className="mt-2 text-4xl font-bold text-zinc-950">
                {venue.name}
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                {venue.address ?? "Адрес не указан"}
              </p>
            </div>

            <form action={createHallWithDemoMap} className="flex flex-wrap gap-2">
              <input name="venueId" type="hidden" value={venue.id} />
              <input
                required
                className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-rose-500"
                name="name"
                placeholder="Название зала"
              />
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                type="submit"
              >
                <AddIcon />
                Добавить зал
              </button>
            </form>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {(venue.halls ?? []).map((hall) => (
              <div
                key={hall.id}
                className="rounded-3xl border border-zinc-200 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-950">
                      {hall.name}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      {hall.is_published ? "Опубликован" : "Черновик"}
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
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                      type="submit"
                    >
                      {hall.is_published ? <EyeOffIcon /> : <EyeIcon />}
                      {hall.is_published ? "Снять" : "Опубликовать"}
                    </button>
                  </form>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                    href={`/halls/${hall.id}/editor`}
                  >
                    <EditIcon />
                    Редактор
                  </Link>
                  {hall.is_published ? (
                    <Link
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900"
                      href={`/embed/${hall.id}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <WidgetIcon />
                      Виджет
                      <ExternalLinkIcon />
                    </Link>
                  ) : (
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-400"
                      disabled
                      type="button"
                    >
                      <WidgetIcon />
                      Виджет
                    </button>
                  )}
                  <code className="rounded-full bg-zinc-100 px-4 py-2 text-xs text-zinc-700">
                    /embed/{hall.id}
                  </code>
                </div>
              </div>
            ))}
          </div>

          {(venue.halls ?? []).length === 0 ? (
            <div className="mt-8 rounded-3xl bg-zinc-50 p-6 text-sm text-zinc-600">
              В этой площадке пока нет залов. Добавьте первый зал через форму
              выше.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
