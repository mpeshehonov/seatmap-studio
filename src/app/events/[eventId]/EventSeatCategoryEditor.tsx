"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "react-toastify";

import { assignEventSeatCategory } from "./actions";
import {
  EVENT_SEAT_CATEGORY_OPTIONS,
  type EventSeatCategory,
} from "@/lib/seatmap/event-seat-categories";
import { SeatMapViewer } from "@/lib/seatmap/SeatMapViewer";
import { type SeatMapJson } from "@/lib/seatmap/seatmap";

type EventSeatCategoryEditorProps = {
  eventId: string;
  hallId: string;
  map: SeatMapJson;
  initialSeatCategories: Record<string, EventSeatCategory>;
};

export function EventSeatCategoryEditor({
  eventId,
  hallId,
  map,
  initialSeatCategories,
}: EventSeatCategoryEditorProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<EventSeatCategory>("standard");
  const [seatCategories, setSeatCategories] = useState(initialSeatCategories);
  const [isPending, startTransition] = useTransition();
  const categoryCounts = useMemo(() => {
    return EVENT_SEAT_CATEGORY_OPTIONS.map((option) => ({
      ...option,
      count: Object.values(seatCategories).filter(
        (category) => category === option.value,
      ).length,
    }));
  }, [seatCategories]);

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

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="flex flex-col gap-4">
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Категория</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Выберите места на карте и назначьте им категорию для этого события.
          </p>
          <div className="mt-4 grid gap-2">
            {EVENT_SEAT_CATEGORY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`rounded-2xl border p-4 text-sm ${
                  selectedCategory === option.value
                    ? "border-rose-400 bg-rose-50"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <input
                  className="sr-only"
                  disabled={isPending}
                  name="category"
                  type="radio"
                  value={option.value}
                  checked={selectedCategory === option.value}
                  onChange={() => setSelectedCategory(option.value)}
                />
                <span className="font-semibold text-zinc-950">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-zinc-500">
                  {option.description}
                </span>
              </label>
            ))}
          </div>
          <button
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isPending}
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
                key={option.value}
                className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-zinc-800">
                  {option.label}
                </span>
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
