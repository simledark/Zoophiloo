"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Listing } from "@/types";
import { ListingCard } from "@/components/listings/listing-card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function FavorisPage() {
  const { user } = useStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getBrowserClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("favoris")
      .select("listing:listings(*, profiles(id, username, display_name, avatar_url, city))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setListings(data?.map((f: any) => f.listing).filter(Boolean) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app py-8">
        <h1 className="font-syne font-extrabold text-2xl text-ink mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-400 fill-current" />
          Mes favoris
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white rounded-2xl border border-sand animate-shimmer" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-sand">
            <Heart className="w-12 h-12 text-ink/10 mx-auto mb-4" />
            <h2 className="font-syne font-bold text-lg text-ink mb-2">Aucun favori</h2>
            <p className="font-space text-sm text-ink/50 mb-6">
              Cliquez sur le ❤️ d&apos;une annonce pour l&apos;ajouter à vos favoris.
            </p>
            <Link href="/annonces" className="btn-primary">
              Parcourir les annonces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
