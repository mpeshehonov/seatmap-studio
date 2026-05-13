import { notFound } from "next/navigation";

import { getEmbedHallPayload } from "@/lib/seatmap/embed-data";
import { SeatMapViewer } from "@/lib/seatmap/SeatMapViewer";

type EmbedPageProps = {
  params: Promise<{
    hallId: string;
  }>;
};

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { hallId } = await params;
  const payload = await getEmbedHallPayload(hallId);

  if (!payload) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white p-4">
      <section className="mx-auto max-w-5xl">
        <div className="mb-4 rounded-3xl bg-zinc-950 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-300">
            Embed widget
          </p>
          <h1 className="mt-2 text-2xl font-bold">{payload.hall.name}</h1>
          {payload.hall.venueName ? (
            <p className="mt-1 text-sm text-zinc-300">
              {payload.hall.venueName}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-zinc-300">
            Public hall id: <code>{hallId}</code>
          </p>
        </div>
        <SeatMapViewer map={payload.map} statuses={payload.statuses} />
      </section>
    </main>
  );
}
