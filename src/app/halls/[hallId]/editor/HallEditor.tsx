"use client";

import { useMemo, useState, useTransition } from "react";

import { saveSeatMap, type SaveSeatMapResult } from "./actions";
import {
  AddIcon,
  SaveIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { SeatMapViewer } from "@/lib/seatmap/SeatMapViewer";
import {
  appendSeatRow,
  appendShape,
  listSeatIds,
  removeSeatMapElement,
  type SeatDefinition,
  type SeatMapJson,
  type ShapeElement,
  updateSeatMapMetadata,
} from "@/lib/seatmap/seatmap";

type HallEditorProps = {
  hallId: string;
  initialMap: SeatMapJson;
};

const categories: SeatDefinition["category"][] = [
  "standard",
  "vip",
  "accessible",
];

export function HallEditor({ hallId, initialMap }: HallEditorProps) {
  const [map, setMap] = useState(initialMap);
  const [rowLabel, setRowLabel] = useState(nextRowLabel(initialMap));
  const [seatCount, setSeatCount] = useState(12);
  const [rowPrice, setRowPrice] = useState(1500);
  const [rowCategory, setRowCategory] =
    useState<SeatDefinition["category"]>("standard");
  const [shapeLabel, setShapeLabel] = useState("Stage");
  const [shapeType, setShapeType] = useState<ShapeElement["shape"]>("stage");
  const [message, setMessage] = useState<SaveSeatMapResult | null>(null);
  const [isSaving, startSaving] = useTransition();

  const seatCountTotal = useMemo(() => listSeatIds(map).length, [map]);

  function addRow() {
    const rowIndex = map.elements.filter((element) => element.kind === "row").length;
    const nextMap = appendSeatRow(map, {
      idPrefix: hallId,
      label: rowLabel,
      seatCount,
      category: rowCategory,
      price: rowPrice,
      x: 160,
      y: 140 + rowIndex * 38,
      seatSpacing: 28,
    });

    setMap(nextMap);
    setRowLabel(nextRowLabel(nextMap));
    setMessage(null);
  }

  function addShape() {
    const shapeIndex = map.elements.filter((element) => element.kind === "shape").length + 1;

    setMap((currentMap) =>
      appendShape(currentMap, {
        id: `${hallId}-shape-${shapeIndex}`,
        label: shapeLabel,
        shape: shapeType,
        x: 280,
        y: 48 + (shapeIndex - 1) * 72,
        width: shapeType === "stage" ? 200 : 160,
        height: shapeType === "stage" ? 56 : 90,
      }),
    );
    setMessage(null);
  }

  function saveCurrentMap() {
    const formData = new FormData();
    formData.set("hallId", hallId);
    formData.set("mapJson", JSON.stringify(map));

    startSaving(async () => {
      const result = await saveSeatMap(formData);
      setMessage(result);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="flex flex-col gap-4">
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Параметры схемы</h2>
          <div className="mt-4 grid gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Название схемы
              <input
                className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-rose-500"
                value={map.name}
                onChange={(event) =>
                  setMap((currentMap) =>
                    updateSeatMapMetadata(currentMap, {
                      name: event.target.value,
                      width: currentMap.viewport.width,
                      height: currentMap.viewport.height,
                    }),
                  )
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Ширина"
                value={map.viewport.width}
                onChange={(value) =>
                  setMap((currentMap) =>
                    updateSeatMapMetadata(currentMap, {
                      name: currentMap.name,
                      width: value,
                      height: currentMap.viewport.height,
                    }),
                  )
                }
              />
              <NumberField
                label="Высота"
                value={map.viewport.height}
                onChange={(value) =>
                  setMap((currentMap) =>
                    updateSeatMapMetadata(currentMap, {
                      name: currentMap.name,
                      width: currentMap.viewport.width,
                      height: value,
                    }),
                  )
                }
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Добавить ряд</h2>
          <div className="mt-4 grid gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Метка ряда
              <input
                className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-rose-500"
                value={rowLabel}
                onChange={(event) => setRowLabel(event.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Мест"
                value={seatCount}
                onChange={setSeatCount}
              />
              <NumberField
                label="Цена"
                value={rowPrice}
                onChange={setRowPrice}
              />
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Категория
              <select
                className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-rose-500"
                value={rowCategory}
                onChange={(event) =>
                  setRowCategory(event.target.value as SeatDefinition["category"])
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
              type="button"
              onClick={addRow}
            >
              <AddIcon />
              Добавить прямой ряд
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Добавить фигуру</h2>
          <div className="mt-4 grid gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Название
              <input
                className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-rose-500"
                value={shapeLabel}
                onChange={(event) => setShapeLabel(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Тип
              <select
                className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-rose-500"
                value={shapeType}
                onChange={(event) =>
                  setShapeType(event.target.value as ShapeElement["shape"])
                }
              >
                <option value="stage">Сцена</option>
                <option value="rectangle">Прямоугольник</option>
              </select>
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
              type="button"
              onClick={addShape}
            >
              <AddIcon />
              Добавить фигуру
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-950">Элементы</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {map.elements.length} элементов, {seatCountTotal} мест
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
              type="button"
              disabled={isSaving}
              onClick={saveCurrentMap}
            >
              <SaveIcon />
              {isSaving ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>

          {message ? (
            <p
              className={`mt-4 rounded-2xl p-3 text-sm ${
                message.ok
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message.message}
            </p>
          ) : null}

          <div className="mt-4 flex max-h-72 flex-col gap-2 overflow-auto">
            {map.elements.map((element) => (
              <div
                key={element.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {element.label}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {element.kind === "row"
                      ? `Ряд, ${element.seats.length} мест`
                      : `Фигура: ${element.shape}`}
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                  type="button"
                  onClick={() =>
                    setMap((currentMap) =>
                      removeSeatMapElement(currentMap, element.id),
                    )
                  }
                >
                  <TrashIcon />
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <div className="min-w-0">
        <SeatMapViewer map={map} readonly />
        <details className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
          <summary className="text-sm font-semibold text-zinc-700">
            JSON схемы
          </summary>
          <pre className="mt-4 max-h-80 overflow-auto rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100">
            {JSON.stringify(map, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
      {label}
      <input
        className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-rose-500"
        min={0}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function nextRowLabel(map: SeatMapJson): string {
  const rows = map.elements.filter((element) => element.kind === "row");
  return String.fromCharCode(65 + rows.length);
}
