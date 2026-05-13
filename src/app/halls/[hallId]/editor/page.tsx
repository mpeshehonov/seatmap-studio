import Link from "next/link";
import { notFound } from "next/navigation";

import { setHallPublished } from "@/app/venues/actions";
import { demoSeatStatuses } from "@/lib/seatmap/demo-data";
import { SeatMapViewer } from "@/lib/seatmap/SeatMapViewer";
import { buildDemoSeatMap, type SeatMapJson } from "@/lib/seatmap/seatmap";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type EditorPageProps = {
  params: Promise<{
    hallId: string;
  }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { hallId } = await params;
  const { supabase } = await requireAuthenticatedUser();
  const { data: hall } = await supabase
    .from("halls")
    .select("id,name,is_published")
    .eq("id", hallId)
    .single();
  const { data: seatMap } = await supabase
    .from("seat_maps")
    .select("map_json")
    .eq("hall_id", hallId)
    .maybeSingle();

  if (!hall) {
    notFound();
  }

  const map = (seatMap?.map_json as unknown as SeatMapJson | undefined) ?? buildDemoSeatMap();

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <Link className="text-sm text-zinc-600" href="/dashboard">
          ← Назад в админку
        </Link>

        <header className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
            Редактор схемы
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-zinc-950">
                {hall.name}
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Hall ID: <code>{hallId}</code>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <form action={setHallPublished}>
                <input name="hallId" type="hidden" value={hall.id} />
                <input
                  name="isPublished"
                  type="hidden"
                  value={String(!hall.is_published)}
                />
                <button
                  className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
                  type="submit"
                >
                  {hall.is_published ? "Снять с публикации" : "Опубликовать"}
                </button>
              </form>
              <Link
                className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900"
                href={`/embed/${hallId}`}
              >
                Открыть embed
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">Инструменты MVP</h2>
            <div className="mt-4 flex flex-col gap-3">
              {[
                "Добавить прямой ряд",
                "Добавить сцену",
                "Изменить цену категории",
                "Сохранить JSON",
              ].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-2xl border border-zinc-200 px-4 py-3 text-left text-sm font-semibold text-zinc-700"
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-zinc-500">
              Кнопки пока обозначают целевую UX-структуру. Следующий этап —
              подключить реальные операции с `seat_maps.map_json`.
            </p>
          </aside>

          <SeatMapViewer
            map={map}
            readonly
            statuses={demoSeatStatuses}
          />
        </div>
      </section>
    </main>
  );
}
