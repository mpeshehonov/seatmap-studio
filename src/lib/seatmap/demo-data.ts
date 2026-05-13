import { buildDemoSeatMap, type SeatStatus } from "./seatmap";

export const demoHall = {
  id: "demo-hall",
  name: "Большой зал",
  venueName: "Centre Sant Pere 1892",
  seatMap: buildDemoSeatMap(),
  embedUrl: "/embed/demo-hall",
};

export const demoSeatStatuses: Record<string, SeatStatus> = {
  "demo-a-10": "sold",
  "demo-a-11": "sold",
  "demo-b-4": "held",
  "demo-c-8": "sold",
  "demo-d-1": "held",
};
