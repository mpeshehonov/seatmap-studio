"use client";

import { type PointerEvent, useMemo, useState } from "react";

import { RotateLeftIcon, RotateRightIcon } from "@/components/ui/icons";
import {
  type SeatMapElement,
  type SeatMapJson,
  type SeatStatus,
  type ShapeElement,
} from "./seatmap";

type SeatMapViewerProps = {
  map: SeatMapJson;
  statuses?: Record<string, SeatStatus>;
  readonly?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (elementId: string) => void;
  onMoveElement?: (elementId: string, position: { x: number; y: number }) => void;
  onRotateElement?: (elementId: string, delta: number) => void;
};

type DragState = {
  elementId: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
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
  selectedElementId = null,
  onSelectElement,
  onMoveElement,
  onRotateElement,
}: SeatMapViewerProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const selectedLabel = useMemo(
    () => selectedSeatIds.join(", ") || "нет выбранных мест",
    [selectedSeatIds],
  );
  const isEditingElements = Boolean(onMoveElement);

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

  function startElementDrag(
    element: SeatMapElement,
    event: PointerEvent<HTMLDivElement>,
  ) {
    onSelectElement?.(element.id);

    if (!onMoveElement) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      elementId: element.id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: element.x,
      startY: element.y,
    });
  }

  function moveElement(event: PointerEvent<HTMLDivElement>) {
    if (!dragState || !onMoveElement || dragState.pointerId !== event.pointerId) {
      return;
    }

    onMoveElement(dragState.elementId, {
      x: Math.round(dragState.startX + event.clientX - dragState.startClientX),
      y: Math.round(dragState.startY + event.clientY - dragState.startClientY),
    });
  }

  function stopElementDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragState(null);
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
                return (
                  <Shape
                    key={element.id}
                    element={element}
                    isEditable={isEditingElements}
                    isSelected={selectedElementId === element.id}
                    onRotate={onRotateElement}
                    onPointerDown={startElementDrag}
                    onPointerMove={moveElement}
                    onPointerUp={stopElementDrag}
                  />
                );
              case "row":
                return (
                  <div
                    key={element.id}
                    className={`absolute flex items-center gap-2 rounded-xl p-1 ${
                      isEditingElements ? "cursor-grab touch-none active:cursor-grabbing" : ""
                    } ${
                      selectedElementId === element.id
                        ? "ring-2 ring-rose-500 ring-offset-2"
                        : ""
                    }`}
                    style={{
                      left: element.x,
                      top: element.y,
                      transform: `rotate(${element.rotation}deg)`,
                    }}
                    onPointerDown={(event) => startElementDrag(element, event)}
                    onPointerMove={moveElement}
                    onPointerUp={stopElementDrag}
                    onPointerCancel={stopElementDrag}
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
                            disabled={
                              readonly || status === "sold" || status === "held"
                            }
                            onClick={() => toggleSeat(seat.id, status)}
                            className={`grid h-5 w-5 place-items-center rounded-full border text-[9px] transition ${statusClasses[status]}`}
                            title={`${element.label}${seat.label}`}
                          >
                            {seat.label}
                          </button>
                        );
                      })}
                    </div>
                    {selectedElementId === element.id && onRotateElement ? (
                      <ElementRotationControls
                        elementId={element.id}
                        onRotate={onRotateElement}
                      />
                    ) : null}
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

function Shape({
  element,
  isEditable,
  isSelected,
  onRotate,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  element: ShapeElement;
  isEditable: boolean;
  isSelected: boolean;
  onRotate?: (elementId: string, delta: number) => void;
  onPointerDown: (
    element: ShapeElement,
    event: PointerEvent<HTMLDivElement>,
  ) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={`absolute grid place-items-center rounded-2xl border border-zinc-300 bg-zinc-200 text-sm font-semibold text-zinc-700 ${
        isEditable ? "cursor-grab touch-none active:cursor-grabbing" : ""
      } ${isSelected ? "ring-2 ring-rose-500 ring-offset-2" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
      }}
      onPointerDown={(event) => onPointerDown(element, event)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {element.label}
      {isSelected && onRotate ? (
        <ElementRotationControls
          elementId={element.id}
          onRotate={onRotate}
        />
      ) : null}
    </div>
  );
}

function ElementRotationControls({
  elementId,
  onRotate,
}: {
  elementId: string;
  onRotate: (elementId: string, delta: number) => void;
}) {
  return (
    <div
      className="absolute -top-11 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-lg"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        aria-label="Повернуть против часовой стрелки"
        className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRotate(elementId, -15);
        }}
      >
        <RotateLeftIcon size={16} />
      </button>
      <button
        aria-label="Повернуть по часовой стрелке"
        className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRotate(elementId, 15);
        }}
      >
        <RotateRightIcon size={16} />
      </button>
    </div>
  );
}

function assertNever(value: never): never {
  throw new Error(`Unhandled seat map element: ${JSON.stringify(value)}`);
}
