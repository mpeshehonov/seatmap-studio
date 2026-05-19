"use client";

import Link from "next/link";

import {
  createEventForHall,
  createHallWithDemoMap,
  deleteEvent,
  detachEventFromHall,
  moveEventToHall,
  setHallPublished,
} from "@/app/venues/actions";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Dialog } from "@/components/ui/dialog";
import {
  AddIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  ExternalLinkIcon,
  LinkIcon,
  TrashIcon,
  UnlinkIcon,
  WidgetIcon,
} from "@/components/ui/icons";
import {
  type SeatMapListEvent,
  type SeatMapListItem,
} from "@/lib/seatmap/list-items";
import { SeatMapMiniPreview } from "./SeatMapMiniPreview";

type SeatMapVariantListProps = {
  variants: SeatMapListItem[];
  unassignedEvents?: SeatMapListEvent[];
};

export function SeatMapVariantList({
  variants,
  unassignedEvents = [],
}: SeatMapVariantListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-950">Схемы залов</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Создание вынесено в отдельный шаг, чтобы не мешать просмотру списка.
          </p>
        </div>
        <CreateVariantDialog />
      </div>

      {variants.length === 0 ? (
        <p className="rounded-3xl bg-zinc-50 p-6 text-sm text-zinc-600">
          Вариантов схем пока нет. Создайте первую схему через кнопку выше.
        </p>
      ) : null}

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

                    <div className="mt-5 grid gap-3 border-t border-zinc-100 pt-4 xl:grid-cols-[1fr_auto]">
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
                                <EventActions
                                  event={event}
                                  variants={variants}
                                  currentHallId={variant.id}
                                />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                    Для этой схемы ещё нет событий.
                  </p>
                )}
              </div>

                      <CreateEventDialog hallId={variant.id} />
            </div>
          </div>
        </article>
      ))}
      {unassignedEvents.length > 0 ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-bold text-zinc-950">
            События без схемы
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Это черновики событий, которые можно удалить или привязать к другой
            схеме.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {unassignedEvents.map((event) => (
              <li
                key={event.id}
                className="rounded-2xl bg-white px-4 py-3 text-sm text-zinc-700"
              >
                <span className="font-semibold text-zinc-950">
                  {event.title}
                </span>
                {event.starts_at ? (
                  <span className="ml-2 text-xs text-zinc-500">
                    {formatEventDate(event.starts_at)}
                  </span>
                ) : null}
                <EventActions event={event} variants={variants} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function CreateVariantDialog() {
  return (
    <Dialog
      title="Новая схема зала"
      description="Создайте вариант рассадки. После создания откроется редактор схемы."
      trigger={
        <button className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white">
          <AddIcon />
          Создать схему
        </button>
      }
    >
      <form action={createHallWithDemoMap} className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Название схемы
          <input
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-normal outline-none focus:border-rose-500"
            name="name"
            placeholder="Например, Концертный зал"
          />
        </label>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
          type="submit"
        >
          <AddIcon />
          Создать и открыть редактор
        </button>
      </form>
    </Dialog>
  );
}

function CreateEventDialog({ hallId }: { hallId: string }) {
  return (
    <Dialog
      title="Новое событие"
      description="Событие сразу привяжется к выбранной схеме. Дату можно оставить пустой и заполнить позже."
      trigger={
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">
          <AddIcon />
          Создать событие
        </button>
      }
    >
      <form action={createEventForHall} className="grid gap-4">
        <input name="hallId" type="hidden" value={hallId} />
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Название события
          <input
            required
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-normal outline-none focus:border-rose-500"
            name="title"
            placeholder="Например, Большой концерт"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Дата и время
          <DateTimePicker name="startsAt" />
        </label>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
          type="submit"
        >
          <AddIcon />
          Создать событие
        </button>
      </form>
    </Dialog>
  );
}

function EventActions({
  event,
  variants,
  currentHallId,
}: {
  event: SeatMapListEvent;
  variants: SeatMapListItem[];
  currentHallId?: string;
}) {
  const attachableVariants = variants.filter(
    (variant) => variant.id !== currentHallId,
  );

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {currentHallId ? (
        <form action={detachEventFromHall}>
          <input name="eventId" type="hidden" value={event.id} />
          <input name="hallId" type="hidden" value={currentHallId} />
          <button
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700"
            type="submit"
          >
            <UnlinkIcon size={14} />
            Отвязать
          </button>
        </form>
      ) : null}
      {attachableVariants.length > 0 ? (
        <form action={moveEventToHall} className="flex flex-wrap gap-2">
          <input name="eventId" type="hidden" value={event.id} />
          {currentHallId ? (
            <input name="sourceHallId" type="hidden" value={currentHallId} />
          ) : null}
          <select
            required
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 outline-none focus:border-rose-500"
            name="hallId"
            defaultValue=""
          >
            <option disabled value="">
              {currentHallId ? "Перенести в..." : "Привязать к..."}
            </option>
            {attachableVariants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name}
              </option>
            ))}
          </select>
          <button
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700"
            type="submit"
          >
            <LinkIcon size={14} />
            Сохранить
          </button>
        </form>
      ) : null}
      <form action={deleteEvent}>
        <input name="eventId" type="hidden" value={event.id} />
        <button
          className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700"
          type="submit"
        >
          <TrashIcon size={14} />
          Удалить
        </button>
      </form>
    </div>
  );
}

function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
