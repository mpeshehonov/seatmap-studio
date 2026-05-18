import { type SeatMapJson } from "@/lib/seatmap/seatmap";

type SeatMapMiniPreviewProps = {
  map: SeatMapJson | null;
};

export function SeatMapMiniPreview({ map }: SeatMapMiniPreviewProps) {
  if (!map) {
    return (
      <div className="grid h-32 w-48 place-items-center rounded-2xl bg-zinc-100 text-xs font-semibold text-zinc-400">
        Нет схемы
      </div>
    );
  }

  return (
    <svg
      aria-label={`Мини-превью схемы ${map.name || "без названия"}`}
      className="h-32 w-48 rounded-2xl bg-zinc-50"
      role="img"
      viewBox={`0 0 ${map.viewport.width} ${map.viewport.height}`}
    >
      <rect
        fill="transparent"
        height={map.viewport.height}
        width={map.viewport.width}
        x="0"
        y="0"
      />
      {map.elements.map((element) => {
        switch (element.kind) {
          case "shape":
            return (
              <g
                key={element.id}
                transform={`rotate(${element.rotation} ${element.x + element.width / 2} ${element.y + element.height / 2})`}
              >
                <rect
                  fill="#e4e4e7"
                  height={element.height}
                  rx="12"
                  stroke="#a1a1aa"
                  strokeWidth="2"
                  width={element.width}
                  x={element.x}
                  y={element.y}
                />
              </g>
            );
          case "row":
            return (
              <g
                key={element.id}
                transform={`translate(${element.x} ${element.y}) rotate(${element.rotation})`}
              >
                {element.seats.map((seat, index) => (
                  <circle
                    key={seat.id}
                    cx={28 + index * element.seatSpacing}
                    cy="10"
                    fill="#ffe4e6"
                    r="8"
                    stroke="#fb7185"
                    strokeWidth="2"
                  />
                ))}
              </g>
            );
          default:
            return assertNever(element);
        }
      })}
    </svg>
  );
}

function assertNever(value: never): never {
  throw new Error(`Unhandled mini preview element: ${JSON.stringify(value)}`);
}
