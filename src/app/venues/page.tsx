import Link from "next/link";

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

type HallSummary = {
  id: string;
  name: string;
  is_published: boolean;
};

type VenueWithHalls = {
  id: string;
  name: string;
  halls: HallSummary[] | null;
};

type SeatMapVariant = HallSummary;

export default async function VenuesPage() {
  const { supabase } = await requireAuthenticatedUser();
  const { data: venues, error } = await supabase
    .from("venues")
    .select("id,name,halls(id,name,is_published)")
    .order("created_at", { ascending: false })
    .returns<VenueWithHalls[]>();
  const variants: SeatMapVariant[] = (venues ?? []).flatMap(
    (venue) => venue.halls ?? [],
  );

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

          <form
            action={createHallWithDemoMap}
            className="mt-8 rounded-3xl bg-zinc-50 p-5"
          >
            <h2 className="text-lg font-bold text-zinc-950">
              Новый вариант схемы
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                required
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-rose-500"
                name="name"
                placeholder="Например, Основная рассадка"
              />
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
                type="submit"
              >
                <AddIcon />
                Создать
              </button>
            </div>
          </form>

          {error ? (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
              Не удалось загрузить варианты схем: {error.message}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-3xl border border-zinc-200 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-950">
                      {variant.name}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      {variant.is_published ? "Опубликована" : "Черновик"}
                    </p>
                  </div>
                  <form action={setHallPublished}>
                    <input name="hallId" type="hidden" value={variant.id} />
                    <input
                      name="isPublished"
                      type="hidden"
                      value={String(!variant.is_published)}
                    />
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                      type="submit"
                    >
                      {variant.is_published ? <EyeOffIcon /> : <EyeIcon />}
                      {variant.is_published ? "Снять" : "Опубликовать"}
                    </button>
                  </form>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                    href={`/halls/${variant.id}/editor`}
                  >
                    <EditIcon />
                    Редактор
                  </Link>
                  {variant.is_published ? (
                    <Link
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900"
                      href={`/embed/${variant.id}`}
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
                    /embed/{variant.id}
                  </code>
                </div>
              </div>
            ))}
            {variants.length === 0 ? (
              <p className="rounded-3xl bg-zinc-50 p-6 text-sm text-zinc-600">
                Вариантов схем пока нет. Создайте первую схему выше.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
