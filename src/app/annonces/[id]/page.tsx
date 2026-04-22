import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ListingDetail } from "@/components/listings/listing-detail";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default async function AnnoncePage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*, profiles(id, username, display_name, avatar_url, city, rating_avg, rating_count, listings_count, created_at, is_verified)")
    .eq("id", params.id)
    .single();

  if (!listing) notFound();

  // Incrémenter les vues
  await supabase
    .from("listings")
    .update({ views_count: (listing.views_count ?? 0) + 1 })
    .eq("id", params.id);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app py-6">
        <ListingDetail listing={listing as any} />
      </main>
      <Footer />
    </div>
  );
}
