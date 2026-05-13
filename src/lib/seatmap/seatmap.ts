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
