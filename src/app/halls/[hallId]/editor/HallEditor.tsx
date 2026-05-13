"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { saveSeatMap, type SaveSeatMapResult } from "./actions";
import { setHallPublished } from "@/app/venues/actions";
import {
  AddIcon,
  EyeIcon,
  EyeOffIcon,
  ExternalLinkIcon,
  SaveIcon,
  TrashIcon,
  WidgetIcon,
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
  updateSeatMapElement,
} from "@/lib/seatmap/seatmap";

type HallEditorProps = {
  hallId: string;
  hallName: string;
  isPublished: boolean;
  initialMap: SeatMapJson;
};

const categories: SeatDefinition["category"][] = [
  "standard",
  "vip",
  "accessible",
];

export function HallEditor({
  hallId,
  hallName,
  isPublished,
  initialMap,
}: HallEditorProps) {
  const [map, setMap] = useState(initialMap);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    initialMap.elements[0]?.id ?? null,
  );
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
    const rowY = getNextElementY(map);
    const nextMap = appendSeatRow(map, {
      idPrefix: hallId,
      label: rowLabel,
      seatCount,
      category: rowCategory,
      price: rowPrice,
      x: 160,
      y: rowY,
      seatSpacing: 28,
    });

    setMap(nextMap);
    setSelectedElementId(nextMap.elements.at(-1)?.id ?? null);
    setRowLabel(nextRowLabel(nextMap));
    setMessage(null);
  }

  function addShape() {
    const shapeIndex = map.elements.filter((element) => element.kind === "shape").length + 1;
    const shapeY = getNextElementY(map);

    setMap((currentMap) => {
      const nextMap = appendShape(currentMap, {
        id: `${hallId}-shape-${shapeIndex}`,
        label: shapeLabel,
        shape: shapeType,
        x: 280,
        y: shapeY,
        width: shapeType === "stage" ? 200 : 160,
        height: shapeType === "stage" ? 56 : 90,
      });

      setSelectedElementId(nextMap.elements.at(-1)?.id ?? null);
      return nextMap;
    });
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

  function updateElement(
    elementId: string,
    input: Parameters<typeof updateSeatMapElement>[2],
  ) {
    setMap((currentMap) => updateSeatMapElement(currentMap, elementId, input));
    setMessage(null);
  }

  return (
    <>
      <header className="rounded-4xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
          Редактор схемы
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-zinc-950">{hallName}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Hall ID: <code>{hallId}</code>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
              type="button"
              disabled={isSaving}
              onClick={saveCurrentMap}
            >
              <SaveIcon />
              {isSaving ? "Сохраняем..." : "Сохранить"}
            </button>
            <form action={setHallPublished}>
              <input name="hallId" type="hidden" value={hallId} />
              <input
                name="isPublished"
                type="hidden"
                value={String(!isPublished)}
              />
              <button
                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
                type="submit"
              >
                {isPublished ? <EyeOffIcon /> : <EyeIcon />}
                {isPublished ? "Снять с публикации" : "Опубликовать"}
              </button>
            </form>
            {isPublished ? (
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900"
                href={`/embed/${hallId}`}
                rel="noreferrer"
                target="_blank"
              >
                <WidgetIcon />
                Открыть виджет
                <ExternalLinkIcon />
              </Link>
            ) : (
              <button
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-400"
                disabled
                type="button"
              >
                <WidgetIcon />
                Открыть виджет
              </button>
            )}
          </div>
        </div>
      </header>

      {message ? (
        <div
          className={`fixed right-6 bottom-6 z-50 rounded-2xl px-5 py-4 text-sm font-semibold shadow-lg ${
            message.ok
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
          role="status"
        >
          {message.message}
        </div>
      ) : null}

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
          </div>

          <div className="mt-4 flex max-h-72 flex-col gap-2 overflow-auto">
            {map.elements.map((element) => (
              <div
                key={element.id}
                className={`grid gap-3 rounded-2xl border p-3 ${
                  selectedElementId === element.id
                    ? "border-rose-400 bg-rose-50"
                    : "border-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    className="min-w-0 text-left"
                    type="button"
                    onClick={() => setSelectedElementId(element.id)}
                  >
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {element.label || "Без названия"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {element.kind === "row"
                        ? `Ряд, ${element.seats.length} мест`
                        : `Фигура: ${element.shape}`}
                    </p>
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                    type="button"
                    onClick={() => {
                      setMap((currentMap) =>
                        removeSeatMapElement(currentMap, element.id),
                      );
                      setSelectedElementId(null);
                    }}
                  >
                    <TrashIcon />
                    Удалить
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <NumberField
                    label="X"
                    value={element.x}
                    onChange={(value) => updateElement(element.id, { x: value })}
                  />
                  <NumberField
                    label="Y"
                    value={element.y}
                    onChange={(value) => updateElement(element.id, { y: value })}
                  />
                  <NumberField
                    label="°"
                    value={element.rotation}
                    onChange={(value) =>
                      updateElement(element.id, { rotation: value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                    type="button"
                    onClick={() =>
                      updateElement(element.id, {
                        rotation: element.rotation - 15,
                      })
                    }
                  >
                    -15°
                  </button>
                  <button
                    className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                    type="button"
                    onClick={() =>
                      updateElement(element.id, {
                        rotation: element.rotation + 15,
                      })
                    }
                  >
                    +15°
                  </button>
                </div>
                {element.kind === "shape" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField
                      label="Ширина"
                      value={element.width}
                      onChange={(value) =>
                        updateElement(element.id, { width: value })
                      }
                    />
                    <NumberField
                      label="Высота"
                      value={element.height}
                      onChange={(value) =>
                        updateElement(element.id, { height: value })
                      }
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </aside>

      <div className="min-w-0">
        <SeatMapViewer
          map={map}
          readonly
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onMoveElement={(elementId, position) =>
            updateElement(elementId, position)
          }
        />
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
    </>
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

function getNextElementY(map: SeatMapJson): number {
  if (map.elements.length === 0) {
    return 80;
  }

  return Math.min(
    Math.max(...map.elements.map((element) => element.y)) + 72,
    map.viewport.height - 80,
  );
}
