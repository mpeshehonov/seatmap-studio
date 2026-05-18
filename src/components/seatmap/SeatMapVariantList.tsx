import Link from "next/link";

import {
  createEventForHall,
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
import { type SeatMapListItem } from "@/lib/seatmap/list-items";
import { SeatMapMiniPreview } from "./SeatMapMiniPreview";

type SeatMapVariantListProps = {
  variants: SeatMapListItem[];
};

export function SeatMapVariantList({ variants }: SeatMapVariantListProps) {
  if (variants.length === 0) {
    return (
      <p className="rounded-3xl bg-zinc-50 p-6 text-sm text-zinc-600">
        Вариантов схем пока нет. Создайте первую схему выше.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {variants.map((variant) => (
        <article
          key={variant.id}
          className="grid gap-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm lg:grid-cols-[12rem_1fr]"
        >
          <SeatMapMiniPreview map={variant.map} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-zinc-950">
                  {variant.name}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {variant.isPublished ? "Опубликована" : "Черновик"}
                </p>
              </div>
              <form action={setHallPublished}>
                <input name="hallId" type="hidden" value={variant.id} />
                <input
                  name="isPublished"
                  type="hidden"
                  value={String(!variant.isPublished)}
                />
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                  type="submit"
                >
                  {variant.isPublished ? <EyeOffIcon /> : <EyeIcon />}
                  {variant.isPublished ? "Снять" : "Опубликовать"}
                </button>
              </form>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                href={`/halls/${variant.id}/editor`}
              >
                <EditIcon />
                Редактор
              </Link>
              {variant.isPublished ? (
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
            </div>

            <div className="mt-5 grid gap-3 border-t border-zinc-100 pt-4 xl:grid-cols-[1fr_24rem]">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">События</h3>
                {variant.events.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-2">
                    {variant.events.map((event) => (
                      <li
                        key={event.id}
                        className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700"
                      >
                        <span className="font-semibold text-zinc-950">
                          {event.title}
                        </span>
                        {event.starts_at ? (
                          <span className="ml-2 text-xs text-zinc-500">
                            {formatEventDate(event.starts_at)}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                    Для этой схемы ещё нет событий.
                  </p>
                )}
              </div>

              <form
                action={createEventForHall}
                className="rounded-2xl bg-zinc-50 p-4"
              >
                <input name="hallId" type="hidden" value={variant.id} />
                <h3 className="text-sm font-bold text-zinc-900">
                  Создать событие
                </h3>
                <div className="mt-3 grid gap-2">
                  <input
                    required
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500"
                    name="title"
                    placeholder="Название события"
                  />
                  <input
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500"
                    name="startsAt"
                    type="datetime-local"
                  />
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white"
                    type="submit"
                  >
                    <AddIcon />
                    Создать
                  </button>
                </div>
              </form>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
