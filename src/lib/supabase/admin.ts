import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ⚠️ NE JAMAIS utiliser côté client — service_role uniquement
if (typeof window !== "undefined") {
  throw new Error("supabase/admin ne doit jamais être importé côté client !");
}

export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
