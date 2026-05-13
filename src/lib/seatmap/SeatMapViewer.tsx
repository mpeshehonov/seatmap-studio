"use client";

import { useMemo, useState } from "react";

import {
  type SeatMapJson,
  type SeatStatus,
  type ShapeElement,
} from "./seatmap";

type SeatMapViewerProps = {
  map: SeatMapJson;
  statuses?: Record<string, SeatStatus>;
  readonly?: boolean;
};

const statusClasses: Record<SeatStatus, string> = {
  available: "border-rose-300 bg-rose-100 text-rose-900 hover:bg-rose-200",
  selected: "border-emerald-600 bg-emerald-500 text-white",
  held: "border-amber-400 bg-amber-200 text-amber-900",
  sold: "border-zinc-400 bg-zinc-300 text-zinc-500",
};

export function SeatMapViewer({
  map,
  statuses = {},
  readonly = false,
}: SeatMapViewerProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const selectedLabel = useMemo(
    () => selectedSeatIds.join(", ") || "нет выбранных мест",
    [selectedSeatIds],
  );

  function toggleSeat(seatId: string, status: SeatStatus) {
    if (readonly || status === "sold" || status === "held") {
      return;
    }

    setSelectedSeatIds((current) => {
      if (current.includes(seatId)) {
        return current.filter((id) => id !== seatId);
      }

      return [...current, seatId];
    });
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="overflow-auto rounded-2xl bg-zinc-50">
        <div
          className="relative"
          style={{ width: map.viewport.width, height: map.viewport.height }}
        >
          {map.elements.map((element) => {
            switch (element.kind) {
              case "shape":
                return <Shape key={element.id} element={element} />;
              case "row":
                return (
                  <div
                    key={element.id}
                    className="absolute flex items-center gap-2"
                    style={{
                      left: element.x,
                      top: element.y,
                      transform: `rotate(${element.rotation}deg)`,
                    }}
                  >
                    <span className="w-6 text-right text-xs font-semibold text-zinc-500">
                      {element.label}
                    </span>
                    <div
                      className="flex"
                      style={{ gap: Math.max(element.seatSpacing - 20, 6) }}
                    >
                      {element.seats.map((seat) => {
                        const status = selectedSeatIds.includes(seat.id)
                          ? "selected"
                          : statuses[seat.id] ?? "available";

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            disabled={status === "sold" || status === "held"}
                            onClick={() => toggleSeat(seat.id, status)}
                            className={`grid h-5 w-5 place-items-center rounded-full border text-[9px] transition ${statusClasses[status]}`}
                            title={`${element.label}${seat.label} - ${seat.price} RUB`}
                          >
                            {seat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              default:
                return assertNever(element);
            }
          })}
        </div>
      </div>
      {!readonly ? (
        <div className="mt-4 rounded-2xl bg-zinc-950 p-4 text-sm text-white">
          Выбрано: <span className="font-semibold">{selectedLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

function Shape({ element }: { element: ShapeElement }) {
  return (
    <div
      className="absolute grid place-items-center rounded-2xl border border-zinc-300 bg-zinc-200 text-sm font-semibold text-zinc-700"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
      }}
    >
      {element.label}
    </div>
  );
}

function assertNever(value: never): never {
  throw new Error(`Unhandled seat map element: ${JSON.stringify(value)}`);
}
