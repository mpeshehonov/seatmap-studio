export type SeatMapJson = {
  version: 1;
  name: string;
  viewport: {
    width: number;
    height: number;
  };
  elements: SeatMapElement[];
};

export type SeatMapElement = SeatRowElement | ShapeElement;

export type SeatRowElement = {
  id: string;
  kind: "row";
  label: string;
  x: number;
  y: number;
  rotation: number;
  seatSpacing: number;
  seats: SeatDefinition[];
};

export type SeatDefinition = {
  id: string;
  label: string;
  category: "standard" | "vip" | "accessible";
  price: number;
};

export type ShapeElement = {
  id: string;
  kind: "shape";
  shape: "stage" | "rectangle";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type SeatStatus = "available" | "selected" | "held" | "sold";

export type AppendSeatRowInput = {
  idPrefix: string;
  label: string;
  seatCount: number;
  category?: SeatDefinition["category"];
  price?: number;
  x: number;
  y: number;
  seatSpacing: number;
};

export type AppendShapeInput = {
  id: string;
  label: string;
  shape: ShapeElement["shape"];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type UpdateSeatMapElementInput = {
  label?: string;
  x?: number;
  y?: number;
  rotation?: number;
  width?: number;
  height?: number;
};

const rowSpecs = [
  { label: "A", count: 12, y: 150 },
  { label: "B", count: 12, y: 188 },
  { label: "C", count: 12, y: 226 },
  { label: "D", count: 8, y: 292 },
  { label: "E", count: 8, y: 330 },
];

export function buildDemoSeatMap(): SeatMapJson {
  return {
    version: 1,
    name: "Demo Theatre",
    viewport: {
      width: 760,
      height: 520,
    },
    elements: [
      {
        id: "demo-stage",
        kind: "shape",
        shape: "stage",
        label: "Stage",
        x: 280,
        y: 48,
        width: 200,
        height: 56,
        rotation: 0,
      },
      ...rowSpecs.map<SeatRowElement>((row) => ({
        id: `demo-row-${row.label.toLowerCase()}`,
        kind: "row",
        label: row.label,
        x: row.count === 12 ? 184 : 248,
        y: row.y,
        rotation: 0,
        seatSpacing: 28,
        seats: Array.from({ length: row.count }, (_, index) => ({
          id: `demo-${row.label.toLowerCase()}-${index + 1}`,
          label: String(index + 1),
          category: index > row.count - 3 ? "vip" : "standard",
          price: index > row.count - 3 ? 2500 : 1500,
        })),
      })),
    ],
  };
}

export function listSeatIds(map: SeatMapJson): string[] {
  return map.elements.flatMap((element) => {
    if (element.kind !== "row") {
      return [];
    }

    return element.seats.map((seat) => seat.id);
  });
}

export function appendSeatRow(
  map: SeatMapJson,
  input: AppendSeatRowInput,
): SeatMapJson {
  const normalizedLabel = input.label.trim();
  const rowSlug = slugify(normalizedLabel);
  const seatCount = clampInteger(input.seatCount, 1, 80);
  const category = input.category ?? "standard";
  const price = input.price ?? 0;

  return {
    ...map,
    elements: [
      ...map.elements,
      {
        id: `${input.idPrefix}-row-${rowSlug}`,
        kind: "row",
        label: normalizedLabel,
        x: input.x,
        y: input.y,
        rotation: 0,
        seatSpacing: input.seatSpacing,
        seats: Array.from({ length: seatCount }, (_, index) => ({
          id: `${input.idPrefix}-${rowSlug}-${index + 1}`,
          label: String(index + 1),
          category,
          price,
        })),
      },
    ],
  };
}

export function appendShape(
  map: SeatMapJson,
  input: AppendShapeInput,
): SeatMapJson {
  return {
    ...map,
    elements: [
      ...map.elements,
      {
        id: input.id,
        kind: "shape",
        shape: input.shape,
        label: input.label.trim(),
        x: input.x,
        y: input.y,
        width: input.width,
        height: input.height,
        rotation: input.rotation ?? 0,
      },
    ],
  };
}

export function removeSeatMapElement(
  map: SeatMapJson,
  elementId: string,
): SeatMapJson {
  return {
    ...map,
    elements: map.elements.filter((element) => element.id !== elementId),
  };
}

export function updateSeatMapElement(
  map: SeatMapJson,
  elementId: string,
  input: UpdateSeatMapElementInput,
): SeatMapJson {
  return {
    ...map,
    elements: map.elements.map((element) => {
      if (element.id !== elementId) {
        return element;
      }

      const transformedElement = {
        ...element,
        label: input.label === undefined ? element.label : input.label,
        x: input.x === undefined ? element.x : clampInteger(input.x, -2400, 2400),
        y: input.y === undefined ? element.y : clampInteger(input.y, -1800, 1800),
        rotation:
          input.rotation === undefined
            ? element.rotation
            : clampInteger(input.rotation, -360, 360),
      };

      if (transformedElement.kind !== "shape") {
        return transformedElement;
      }

      return {
        ...transformedElement,
        width:
          input.width === undefined
            ? transformedElement.width
            : clampInteger(input.width, 20, 1200),
        height:
          input.height === undefined
            ? transformedElement.height
            : clampInteger(input.height, 20, 800),
      };
    }),
  };
}

export function updateSeatMapMetadata(
  map: SeatMapJson,
  metadata: { name: string; width: number; height: number },
): SeatMapJson {
  return {
    ...map,
    name: metadata.name,
    viewport: {
      width: clampInteger(metadata.width, 320, 2400),
      height: clampInteger(metadata.height, 240, 1800),
    },
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(Math.round(value), min), max);
}
