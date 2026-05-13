import { NextResponse } from "next/server";

import { getEmbedHallPayload } from "@/lib/seatmap/embed-data";

type EmbedRouteContext = {
  params: Promise<{
    hallId: string;
  }>;
};

export async function GET(_request: Request, context: EmbedRouteContext) {
  const { hallId } = await context.params;
  const payload = await getEmbedHallPayload(hallId);

  if (!payload) {
    return NextResponse.json({ error: "Hall not found" }, { status: 404 });
  }

  return NextResponse.json(payload);
}
