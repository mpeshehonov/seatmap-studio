"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "react-toastify";

import {
  assignEventSeatCategory,
  createEventSeatCategoryDefinition,
} from "./actions";
import {
  buildCategoryLabelMap,
  buildCategoryStyleMap,
  getEventSeatCategoryClassName,
  type EventSeatCategoryDefinition,
  type EventSeatCategoryKey,
} from "@/lib/seatmap/event-seat-categories";
import { SeatMapViewer } from "@/lib/seatmap/SeatMapViewer";
import { type SeatMapJson } from "@/lib/seatmap/seatmap";

type EventSeatCategoryEditorProps = {
  eventId: string;
  hallId: string;
  map: SeatMapJson;
  initialDefinitions: EventSeatCategoryDefinition[];
  initialSeatCategories: Record<string, EventSeatCategoryKey>;
};

export function EventSeatCategoryEditor({
  eventId,
  hallId,
  map,
  initialDefinitions,
  initialSeatCategories,
}: EventSeatCategoryEditorProps) {
  const [definitions, setDefinitions] =
    useState<EventSeatCategoryDefinition[]>(initialDefinitions);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EventSeatCategoryKey>(
    initialDefinitions[0]?.key ?? "standard",
  );
  const [seatCategories, setSeatCategories] = useState(initialSeatCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isCreatingCategory, startCreateCategoryTransition] = useTransition();

  const categoryStyles = useMemo(
    () => buildCategoryStyleMap(definitions),
    [definitions],
  );
  const categoryLabels = useMemo(
    () => buildCategoryLabelMap(definitions),
    [definitions],
  );
  const categoryCounts = useMemo(() => {
    return definitions.map((definition) => ({
      ...definition,
      count: Object.values(seatCategories).filter(
        (category) => category === definition.key,
      ).length,
    }));
  }, [definitions, seatCategories]);

  function saveSelectedSeats() {
    if (selectedSeatIds.length === 0) {
      toast.error("Выберите хотя бы одно место.");
      return;
    }

    const formData = new FormData();
    formData.set("eventId", eventId);
    formData.set("hallId", hallId);
    formData.set("category", selectedCategory);
    formData.set("seatIds", JSON.stringify(selectedSeatIds));

    startTransition(async () => {
      try {
        const result = await assignEventSeatCategory(formData);
        setSeatCategories((current) => ({
          ...current,
          ...Object.fromEntries(
            selectedSeatIds.map((seatId) => [seatId, selectedCategory]),
          ),
        }));
        setSelectedSeatIds([]);
        toast.success(`Категория назначена ${result.count} местам.`);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  function createCategory() {
    const name = newCategoryName.trim();

    if (name.length === 0) {
      toast.error("Укажите название категории.");
      return;
    }

    const formData = new FormData();
    formData.set("eventId", eventId);
    formData.set("name", name);
    if (newCategoryDescription.trim().length > 0) {
      formData.set("description", newCategoryDescription.trim());
    }

    startCreateCategoryTransition(async () => {
      try {
        const result = await createEventSeatCategoryDefinition(formData);
        setDefinitions((current) =>
          [...current, result.definition].sort(
            (left, right) => left.sortOrder - right.sortOrder,
          ),
        );
        setSelectedCategory(result.definition.key);
        setNewCategoryName("");
        setNewCategoryDescription("");
        toast.success("Категория добавлена.");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="flex flex-col gap-4">
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Категории события</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Набор категорий свой для каждого события.
          </p>
          <form
            className="mt-4 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              createCategory();
            }}
          >
            <input
              className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-rose-500"
              disabled={isCreatingCategory}
              placeholder="Название категории"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
            />
            <textarea
              className="min-h-20 rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-rose-500"
              disabled={isCreatingCategory}
              placeholder="Описание (необязательно)"
              value={newCategoryDescription}
              onChange={(event) =>
                setNewCategoryDescription(event.target.value)
              }
            />
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 disabled:opacity-60"
              disabled={isCreatingCategory}
              type="submit"
            >
              {isCreatingCategory ? "Добавляем..." : "Добавить категорию"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Назначение</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Выберите места на карте и назначьте им категорию.
          </p>
          <div className="mt-4 grid gap-2">
            {definitions.map((option) => (
              <label
                key={option.key}
                className={`rounded-2xl border p-4 text-sm ${
                  selectedCategory === option.key
                    ? "border-rose-400 bg-rose-50"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <input
                  className="sr-only"
                  disabled={isPending}
                  name="category"
                  type="radio"
                  value={option.key}
                  checked={selectedCategory === option.key}
                  onChange={() => setSelectedCategory(option.key)}
                />
                <span className="flex items-center gap-2 font-semibold text-zinc-950">
                  <span
                    aria-hidden
                    className={`h-3 w-3 rounded-full border ${getEventSeatCategoryClassName(option.colorToken)}`}
                  />
                  {option.name}
                </span>
                {option.description ? (
                  <span className="mt-1 block text-xs leading-5 text-zinc-500">
                    {option.description}
                  </span>
                ) : null}
              </label>
            ))}
          </div>
          <button
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isPending || definitions.length === 0}
            type="button"
            onClick={saveSelectedSeats}
          >
            {isPending ? "Сохраняем..." : "Назначить выбранным местам"}
          </button>
          <button
            className="mt-2 inline-flex w-full items-center justify-center rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 disabled:opacity-60"
            disabled={isPending || selectedSeatIds.length === 0}
            type="button"
            onClick={() => setSelectedSeatIds([])}
          >
            Очистить выбор
          </button>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Сводка</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Выбрано мест:{" "}
            <span className="font-semibold text-zinc-950">
              {selectedSeatIds.length}
            </span>
          </p>
          <div className="mt-4 grid gap-2">
            {categoryCounts.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-zinc-800">{option.name}</span>
                <span className="text-zinc-500">{option.count}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <div className="min-w-0 xl:sticky xl:top-6 xl:self-start">
        <SeatMapViewer
          map={map}
          readonly={isPending}
          seatCategories={seatCategories}
          seatCategoryStyles={categoryStyles}
          seatCategoryLabels={categoryLabels}
          selectedSeatIds={selectedSeatIds}
          onSelectedSeatIdsChange={setSelectedSeatIds}
        />
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Не удалось сохранить категории мест.";
}
