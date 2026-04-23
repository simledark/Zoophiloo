"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Listing } from "@/types";
import { ListingCard } from "@/components/listings/listing-card";
import { ANIMAL_EMOJIS, PLANT_EMOJIS, TYPE_LABELS, APP_CONFIG } from "@/types";
import Link from "next/link";
import { Plus, Eye, Heart, Trash2, ArchiveX, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function MesAnnonces() {
  const { user } = useStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"actif" | "archive" | "vendu">("actif");
  const supabase = getBrowserClient();

  useEffect(() => {
    if (!user) return;
    loadListings();
  }, [user, filter]);

  const loadListings = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", filter)
      .order("created_at", { ascending: false });
    setListings((data as Listing[]) ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("listings").update({ status }).eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Supprimer cette annonce définitivement ?")) return;
    await supabase.from("listings").update({ status: "supprime" }).eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const getEmoji = (l: Listing) =>
    l.category === "animal" && l.animal_subcategory
      ? ANIMAL_EMOJIS[l.animal_subcategory]
      : l.category === "plante" && l.plant_subcategory
      ? PLANT_EMOJIS[l.plant_subcategory]
      : "🐾";

  const photoUrl = (path: string | null) =>
    path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${APP_CONFIG.storageBucket}/${path}` : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-syne font-extrabold text-2xl text-ink">Mes annonces</h1>
        <Link href="/publier" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Nouvelle annonce
        </Link>
      </div>

      {/* Onglets statut */}
      <div className="flex gap-1 bg-warm rounded-xl p-1 mb-6 w-fit">
        {(["actif", "archive", "vendu"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-space font-medium transition-all capitalize",
              filter === s ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"
            )}
          >
            {s === "actif" ? "✅ Actives" : s === "archive" ? "📦 Archivées" : "✔️ Vendues"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-sand animate-shimmer" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-sand">
          <span className="text-5xl mb-4 block">📭</span>
          <h2 className="font-syne font-bold text-lg text-ink mb-2">Aucune annonce {filter}</h2>
          <Link href="/publier" className="btn-primary mt-4 inline-block">
            Publier une annonce
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const photo = photoUrl(listing.primary_photo);
            return (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-sand p-4 flex gap-4 items-center"
              >
                {/* Photo */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-warm shrink-0">
                  {photo ? (
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {getEmoji(listing)}
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/annonces/${listing.id}`}
                    className="font-space font-semibold text-sm text-ink hover:text-orange transition-colors line-clamp-1"
                  >
                    {listing.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 font-space text-xs text-ink/40">
                    <span>{TYPE_LABELS[listing.type]}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {listing.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {listing.favorites_count}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                </div>

                {/* Prix */}
                <div className="shrink-0 text-right">
                  <span className="font-syne font-bold text-base text-ink">
                    {listing.type === "don" ? (
                      <span className="text-emerald text-sm">Gratuit</span>
                    ) : listing.price != null ? (
                      `${listing.price.toLocaleString("fr-FR")} €`
                    ) : "—"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  {filter === "actif" && (
                    <>
                      <button
                        onClick={() => updateStatus(listing.id, "vendu")}
                        title="Marquer comme vendu"
                        className="p-2 rounded-xl hover:bg-emerald/10 text-emerald transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(listing.id, "archive")}
                        title="Archiver"
                        className="p-2 rounded-xl hover:bg-warm text-ink/40 transition-colors"
                      >
                        <ArchiveX className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {filter === "archive" && (
                    <button
                      onClick={() => updateStatus(listing.id, "actif")}
                      title="Réactiver"
                      className="p-2 rounded-xl hover:bg-orange/10 text-orange transition-colors text-xs font-space"
                    >
                      Réactiver
                    </button>
                  )}
                  <button
                    onClick={() => deleteListing(listing.id)}
                    title="Supprimer"
                    className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
