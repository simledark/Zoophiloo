"use client";

import { useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { useStore } from "@/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, setFavorites } = useStore();

  useEffect(() => {
    const supabase = getBrowserClient();

    // Récupération initiale de la session
    const initAuth = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser({ id: user.id, email: user.email ?? null });

          // Charger le profil
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) setProfile(profile);

          // Charger les favoris
          const { data: favoris } = await supabase
            .from("favoris")
            .select("listing_id")
            .eq("user_id", user.id);

          if (favoris) setFavorites(favoris.map((f) => f.listing_id));
        } else {
          setUser(null);
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listener sur changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? null });

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) setProfile(profile);
      } else {
        setUser(null);
        setProfile(null);
        setFavorites([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading, setFavorites]);

  return <>{children}</>;
}
