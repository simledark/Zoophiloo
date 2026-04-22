"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store";
import type { Profile, Listing, Rating } from "@/types";
import { ListingCard } from "@/components/listings/listing-card";
import { CheckCircle, Star, MapPin, Calendar, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  profile: Profile;
  listings: Listing[];
  ratings: (Rating & { reviewer: Profile })[];
}

export function ProfileView({ profile, listings, ratings }: Props) {
  const { user } = useStore();
  const isOwn = user?.id === profile.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Card profil */}
      <div className="bg-white rounded-2xl border border-sand p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-orange/10 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={80} height={80} className="object-cover" />
              ) : (
                <span className="font-syne font-extrabold text-3xl text-orange">
                  {(profile.display_name ?? profile.username ?? "U")[0].toUpperCase()}
                </span>
              )}
            </div>
            {profile.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal rounded-full flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="font-syne font-extrabold text-2xl text-ink">
                  {profile.display_name ?? profile.username}
                </h1>
                <p className="font-space text-sm text-ink/50">@{profile.username}</p>
              </div>

              {isOwn ? (
                <Link href="/profil/editer" className="btn-secondary text-sm">
                  Modifier mon profil
                </Link>
              ) : user ? (
                <Link
                  href={`/messages?user=${profile.id}`}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contacter
                </Link>
              ) : null}
            </div>

            {profile.bio && (
              <p className="font-space text-sm text-ink/70 mt-3 leading-relaxed max-w-lg">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 mt-3 font-space text-xs text-ink/40">
              {profile.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {profile.city}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Membre depuis {format(new Date(profile.created_at), "MMMM yyyy", { locale: fr })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-sand">
          {[
            { value: profile.listings_count, label: "Annonces" },
            {
              value: profile.rating_avg > 0 ? `⭐ ${profile.rating_avg.toFixed(1)}` : "—",
              label: `${profile.rating_count} avis`,
            },
            { value: profile.is_verified ? "✅ Vérifié" : "Non vérifié", label: "Statut" },
          ].map((stat) => (
            <div key={stat.label} className="text-center bg-warm rounded-xl py-3 px-2">
              <div className="font-syne font-bold text-lg text-ink">{stat.value}</div>
              <div className="font-space text-xs text-ink/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Annonces actives */}
      {listings.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Annonces de {profile.display_name ?? profile.username}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* Avis */}
      {ratings.length > 0 && (
        <div>
          <h2 className="section-title mb-4">
            Avis ({profile.rating_count})
          </h2>
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div key={rating.id} className="bg-white rounded-2xl border border-sand p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
                    <span className="font-space font-bold text-orange text-sm">
                      {(rating.reviewer?.display_name ?? rating.reviewer?.username ?? "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-space font-semibold text-sm text-ink">
                        {rating.reviewer?.display_name ?? rating.reviewer?.username}
                      </span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rating.score ? "text-orange fill-current" : "text-sand"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="font-space text-sm text-ink/70">{rating.comment}</p>
                    )}
                    <p className="font-space text-xs text-ink/30 mt-1">
                      {format(new Date(rating.created_at), "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
