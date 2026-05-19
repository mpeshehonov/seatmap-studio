"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useTransition,
} from "react";
import { toast } from "react-toastify";

import {
  createEventForHall,
  createHallWithDemoMapForClient,
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
        </div>
        <CreateVariantDialog />
      </div>

      {variants.length === 0 ? (
        <p className="rounded-3xl bg-zinc-50 p-6 text-sm text-zinc-600">
          Пока нет ни одной схемы зала.
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
              <ActionForm
                action={setHallPublished}
                successMessage={
                  variant.isPublished
                    ? "Схема снята с публикации."
                    : "Схема опубликована."
                }
              >
                {(pending) => (
                  <>
                    <input name="hallId" type="hidden" value={variant.id} />
                    <input
                      name="isPublished"
                      type="hidden"
                      value={String(!variant.isPublished)}
                    />
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 disabled:opacity-60"
                      disabled={pending}
                      type="submit"
                    >
                      {variant.isPublished ? <EyeOffIcon /> : <EyeIcon />}
                      {pending
                        ? "Сохраняем..."
                        : variant.isPublished
                          ? "Снять"
                          : "Опубликовать"}
                    </button>
                  </>
                )}
              </ActionForm>
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

            <div className="mt-5 border-t border-zinc-100 pt-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">События</h3>
                {variant.events.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-2">
                    {variant.events.map((event) => (
                      <li
                        key={event.id}
                        className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700"
                      >
                        <Link
                          className="font-semibold text-zinc-950 underline-offset-4 hover:text-rose-600 hover:underline"
                          href={`/events/${event.id}`}
                        >
                          {event.title}
                        </Link>
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

              <div className="mt-4">
                <CreateEventDialog hallId={variant.id} />
              </div>
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
            События без привязанной схемы зала.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {unassignedEvents.map((event) => (
              <li
                key={event.id}
                className="rounded-2xl bg-white px-4 py-3 text-sm text-zinc-700"
              >
                <Link
                  className="font-semibold text-zinc-950 underline-offset-4 hover:text-rose-600 hover:underline"
                  href={`/events/${event.id}`}
                >
                  {event.title}
                </Link>
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
  const router = useRouter();

  return (
    <Dialog
      title="Новая схема зала"
      description="Ряды, места и сцена для конкретного варианта зала."
      trigger={
        <button className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white">
          <AddIcon />
          Создать схему
        </button>
      }
    >
      <ActionForm
        action={createHallWithDemoMapForClient}
        successMessage="Схема создана."
        onSuccess={(result) => {
          if (isCreateHallResult(result)) {
            router.push(result.editorPath);
          }
        }}
      >
        {(pending) => (
          <>
            <label className="grid gap-2 text-sm font-semibold text-zinc-800">
              Название схемы
              <input
                required
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-normal outline-none focus:border-rose-500 disabled:bg-zinc-100"
                disabled={pending}
                name="name"
                placeholder="Например, Концертный зал"
              />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              <AddIcon />
              {pending ? "Создаём..." : "Создать и открыть редактор"}
            </button>
          </>
        )}
      </ActionForm>
    </Dialog>
  );
}

function CreateEventDialog({ hallId }: { hallId: string }) {
  return (
    <Dialog
      title="Новое событие"
      description="Мероприятие на этой схеме: название и дата проведения."
      trigger={
        <button className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 underline-offset-4 hover:underline">
          <AddIcon />
          Создать событие
        </button>
      }
    >
      <ActionForm
        action={createEventForHall}
        resetOnSuccess
        successMessage="Событие создано."
      >
        {(pending) => (
          <>
            <input name="hallId" type="hidden" value={hallId} />
            <label className="grid gap-2 text-sm font-semibold text-zinc-800">
              Название события
              <input
                required
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-normal outline-none focus:border-rose-500 disabled:bg-zinc-100"
                disabled={pending}
                name="title"
                placeholder="Например, Большой концерт"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-800">
              Дата и время
              <DateTimePicker disabled={pending} name="startsAt" />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              <AddIcon />
              {pending ? "Создаём..." : "Создать событие"}
            </button>
          </>
        )}
      </ActionForm>
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
        <ActionForm
          action={detachEventFromHall}
          successMessage="Событие отвязано от схемы."
        >
          {(pending) => (
            <>
              <input name="eventId" type="hidden" value={event.id} />
              <input name="hallId" type="hidden" value={currentHallId} />
              <button
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 disabled:opacity-60"
                disabled={pending}
                type="submit"
              >
                <UnlinkIcon size={14} />
                {pending ? "Отвязываем..." : "Отвязать"}
              </button>
            </>
          )}
        </ActionForm>
      ) : null}
      {attachableVariants.length > 0 ? (
        <ActionForm
          action={moveEventToHall}
          className="flex flex-wrap gap-2"
          successMessage={
            currentHallId
              ? "Событие перенесено в другую схему."
              : "Событие привязано к схеме."
          }
        >
          {(pending) => (
            <>
              <input name="eventId" type="hidden" value={event.id} />
              {currentHallId ? (
                <input
                  name="sourceHallId"
                  type="hidden"
                  value={currentHallId}
                />
              ) : null}
              <select
                required
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 outline-none focus:border-rose-500 disabled:bg-zinc-100"
                defaultValue=""
                disabled={pending}
                name="hallId"
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
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 disabled:opacity-60"
                disabled={pending}
                type="submit"
              >
                <LinkIcon size={14} />
                {pending ? "Сохраняем..." : "Сохранить"}
              </button>
            </>
          )}
        </ActionForm>
      ) : null}
      <ActionForm action={deleteEvent} successMessage="Событие удалено.">
        {(pending) => (
          <>
            <input name="eventId" type="hidden" value={event.id} />
            <button
              className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              <TrashIcon size={14} />
              {pending ? "Удаляем..." : "Удалить"}
            </button>
          </>
        )}
      </ActionForm>
    </div>
  );
}

type ActionResult = unknown;

type ActionFormProps = {
  action: (formData: FormData) => Promise<ActionResult>;
  children: (pending: boolean) => ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  successMessage: string;
  onSuccess?: (result: ActionResult) => void;
};

function ActionForm({
  action,
  children,
  className = "grid gap-4",
  resetOnSuccess = false,
  successMessage,
  onSuccess,
}: ActionFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result = await action(formData);
        toast.success(successMessage);
        if (resetOnSuccess) {
          form.reset();
        }
        onSuccess?.(result);
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <fieldset className="contents" disabled={pending}>
        {children(pending)}
      </fieldset>
    </form>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Не удалось выполнить действие.";
}

function isCreateHallResult(
  result: ActionResult,
): result is { editorPath: string } {
  return (
    typeof result === "object" &&
    result !== null &&
    "editorPath" in result &&
    typeof result.editorPath === "string"
  );
}

function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
