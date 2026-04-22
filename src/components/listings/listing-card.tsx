"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useStore } from "@/store";
import { getBrowserClient } from "@/lib/supabase/client";
import { ANIMAL_EMOJIS, PLANT_EMOJIS, TYPE_LABELS, APP_CONFIG } from "@/types";
import type { Listing } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const { user, isFavorite, addFavorite, removeFavorite } = useStore();
  const fav = isFavorite(listing.id);

  const emoji =
    listing.category === "animal" && listing.animal_subcategory
      ? ANIMAL_EMOJIS[listing.animal_subcategory]
      : listing.category === "plante" && listing.plant_subcategory
      ? PLANT_EMOJIS[listing.plant_subcategory]
      : "🐾";

  const photoUrl = listing.primary_photo
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${APP_CONFIG.storageBucket}/${listing.primary_photo}`
    : null;

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    const supabase = getBrowserClient();
    if (fav) {
      await supabase.from("favoris").delete().match({ user_id: user.id, listing_id: listing.id });
      removeFavorite(listing.id);
    } else {
      await supabase.from("favoris").insert({ user_id: user.id, listing_id: listing.id });
      addFavorite(listing.id);
    }
  };

  const typeConfig = {
    vente: { label: "Vente", class: "badge-orange" },
    don: { label: "Don", class: "badge-emerald" },
    echange: { label: "Échange", class: "badge-teal" },
    adoption: { label: "Adoption", class: "badge-violet" },
  };

  const tc = typeConfig[listing.type];

  return (
    <Link
      href={`/annonces/${listing.id}`}
      className={cn("card block group overflow-hidden", className)}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-warm overflow-hidden">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{emoji}</span>
          </div>
        )}

        {/* Badge type */}
        <div className="absolute top-2.5 left-2.5">
          <span className={cn("badge text-xs", tc.class)}>{tc.label}</span>
        </div>

        {/* Bouton favori */}
        {user && (
          <button
            onClick={toggleFavorite}
            className={cn(
              "absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all",
              fav
                ? "bg-red-50 text-red-500"
                : "bg-white/80 text-ink/40 hover:text-red-400 hover:bg-white"
            )}
          >
            <Heart className={cn("w-4 h-4", fav && "fill-current")} />
          </button>
        )}

        {/* Emoji catégorie */}
        <div className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-base shadow-sm">
          {emoji}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-3.5">
        {/* Prix */}
        <div className="flex items-center justify-between mb-1.5">
          {listing.type === "don" ? (
            <span className="font-syne font-bold text-emerald text-lg">Gratuit</span>
          ) : listing.price != null ? (
            <span className="font-syne font-bold text-ink text-lg">
              {listing.price.toLocaleString("fr-FR")} €
              {listing.is_negotiable && (
                <span className="font-space font-normal text-xs text-ink/40 ml-1">négociable</span>
              )}
            </span>
          ) : (
            <span className="font-space text-sm text-ink/40">Prix sur demande</span>
          )}
        </div>

        {/* Titre */}
        <h3 className="font-space font-semibold text-sm text-ink line-clamp-2 mb-2 leading-snug group-hover:text-orange transition-colors">
          {listing.title}
        </h3>

        {/* Infos bas */}
        <div className="flex items-center justify-between text-xs text-ink/40 font-space">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.city}
          </span>
          <span>
            {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>
      </div>
    </Link>
  );
}
