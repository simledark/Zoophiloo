import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "@/components/profile/profile-view";
import { notFound } from "next/navigation";

interface Props {
  params: { username: string };
}

export default async function ProfilPage({ params }: Props) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", profile.id)
    .eq("status", "actif")
    .order("created_at", { ascending: false })
    .limit(12);

  const { data: ratings } = await supabase
    .from("ratings")
    .select("*, reviewer:profiles!ratings_reviewer_id_fkey(username, display_name, avatar_url)")
    .eq("reviewed_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app py-8">
        <ProfileView
          profile={profile as any}
          listings={(listings as any[]) ?? []}
          ratings={(ratings as any[]) ?? []}
        />
      </main>
      <Footer />
    </div>
  );
}
