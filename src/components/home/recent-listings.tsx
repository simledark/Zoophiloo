import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/listing-card";
import Link from "next/link";
import type { Listing } from "@/types";

export async function RecentListings() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles(id, username, display_name, avatar_url, city, rating_avg)")
    .eq("status", "actif")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!listings || listings.length === 0) {
    return (
      <section className="container-app py-10">
        <h2 className="section-title mb-6">✨ Annonces récentes</h2>
        <div className="text-center py-16 bg-white rounded-2xl border border-sand">
          <span className="text-5xl mb-4 block">🐣</span>
          <p className="font-space text-ink/50">Aucune annonce pour l&apos;instant.</p>
          <Link href="/publier" className="btn-primary mt-4 inline-block">
            Publier la première
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-app py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">✨ Annonces récentes</h2>
        <Link href="/annonces" className="text-sm font-space font-medium text-orange hover:text-orange-d transition-colors">
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(listings as Listing[]).map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
