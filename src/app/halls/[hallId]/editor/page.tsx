import Link from "next/link";
import { notFound } from "next/navigation";

import { HallEditor } from "./HallEditor";
import { buildDemoSeatMap, type SeatMapJson } from "@/lib/seatmap/seatmap";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

type EditorPageProps = {
  params: Promise<{
    hallId: string;
  }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { hallId } = await params;
  const { supabase } = await requireAuthenticatedUser();
  const { data: hall } = await supabase
    .from("halls")
    .select("id,name,is_published")
    .eq("id", hallId)
    .single();
  const { data: seatMap } = await supabase
    .from("seat_maps")
    .select("map_json")
    .eq("hall_id", hallId)
    .maybeSingle();

  if (!hall) {
    notFound();
  }

  const map = (seatMap?.map_json as unknown as SeatMapJson | undefined) ?? buildDemoSeatMap();

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <Link className="text-sm text-zinc-600" href="/dashboard">
          ← Назад в админку
        </Link>

        <HallEditor
          hallId={hallId}
          hallName={hall.name}
          initialMap={map}
          isPublished={hall.is_published}
        />
      </section>
    </main>
  );
}
