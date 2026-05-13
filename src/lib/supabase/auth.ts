import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthenticatedSupabase = Awaited<ReturnType<typeof createClient>>;

export type CurrentUser = {
  id: string;
  email: string | null;
};

export async function requireAuthenticatedUser(): Promise<{
  supabase: NonNullable<AuthenticatedSupabase>;
  user: CurrentUser;
}> {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login");
  }

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect("/login");
  }

  return {
    supabase,
    user: {
      id: claims.sub,
      email: typeof claims.email === "string" ? claims.email : null,
    },
  };
}
