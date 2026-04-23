import { Navbar } from "@/components/layout/navbar";
import { MapView } from "@/components/map/map-view";
import { createClient } from "@/lib/supabase/server";

export default async function CartePage() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, type, category, animal_subcategory, plant_subcategory, primary_photo, city, lat, lng")
    .eq("status", "actif")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .limit(200);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 relative">
        <MapView listings={(listings as any[]) ?? []} />
      </main>
    </div>
  );
}
