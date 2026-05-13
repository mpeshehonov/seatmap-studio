"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";
import { type Database } from "@/lib/supabase/database.types";

export function createClient() {
  const env = getPublicEnv();

  if (!env) {
    return null;
  }

  return createBrowserClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
  );
}
