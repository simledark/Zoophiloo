"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store";
import { Heart, Eye, MapPin, Calendar, MessageCircle, Share2, Flag, CheckCircle } from "lucide-react";
import { ANIMAL_EMOJIS, PLANT_EMOJIS, TYPE_LABELS, ANIMAL_LABELS, PLANT_LABELS, HABITAT_LABELS, APP_CONFIG } from "@/types";
import type { Listing } from "@/types";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { getBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  listing: Listing & { profiles: any };
}

export function ListingDetail({ listing }: Props) {
  const { user, isFavorite, addFavorite, removeFavorite } = useStore();
  const [activePhoto, setActivePhoto] = useState(0);
  const [copied, setCopied] = useState(false);
  const fav = isFavorite(listing.id);

  const photos = listing.photos?.length
    ? listing.photos.map((p: string) =>
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${APP_CONFIG.storageBucket}/${p}`
      )
    : [];

  const emoji =
    listing.category === "animal" && listing.animal_subcategory
      ? ANIMAL_EMOJIS[listing.animal_subcategory]
      : listing.category === "plante" && listing.plant_subcategory
      ? PLANT_EMOJIS[listing.plant_subcategory]
      : "🐾";

  const toggleFavorite = async () => {
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

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: listing.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const profile = listing.profiles;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Colonne gauche — photos + détails */}
      <div className="lg:col-span-2 space-y-4">

        {/* Fil d'ariane */}
        <nav className="flex items-center gap-2 text-sm font-space text-ink/40">
          <Link href="/" className="hover:text-orange transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/annonces" className="hover:text-orange transition-colors">Annonces</Link>
          <span>/</span>
          <span className="text-ink/70 line-clamp-1">{listing.title}</span>
        </nav>

        {/* Photos */}
        <div className="bg-white rounded-2xl border border-sand overflow-hidden">
          <div className="relative aspect-[4/3] bg-warm">
            {photos.length > 0 ? (
              <Image
                src={photos[activePhoto]}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">{emoji}</span>
              </div>
            )}

            {/* Actions flottantes */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={toggleFavorite}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm",
                  fav ? "bg-red-50 text-red-500" : "bg-white/90 text-ink/50 hover:text-red-400"
                )}
              >
                <Heart className={cn("w-5 h-5", fav && "fill-current")} />
              </button>
              <button
                onClick={share}
                className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-ink/50 hover:text-orange transition-colors shadow-sm"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {copied && (
              <div className="absolute bottom-3 right-3 bg-ink text-white text-xs font-space px-3 py-1.5 rounded-full animate-fade-in">
                Lien copié !
              </div>
            )}
          </div>

          {/* Miniatures */}
          {photos.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {photos.map((photo: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={cn(
                    "relative w-16 h-16 rounded-xl overflow-hidden shrink-0 transition-all",
                    i === activePhoto ? "ring-2 ring-orange" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <Image src={photo} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos principales */}
        <div className="bg-white rounded-2xl border border-sand p-5 space-y-4">
          {/* Type badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-orange">{TYPE_LABELS[listing.type]}</span>
            {listing.category === "animal" && listing.animal_subcategory && (
              <span className="badge bg-warm text-ink/60">
                {emoji} {ANIMAL_LABELS[listing.animal_subcategory]}
              </span>
            )}
            {listing.category === "plante" && listing.plant_subcategory && (
              <span className="badge bg-warm text-ink/60">
                {emoji} {PLANT_LABELS[listing.plant_subcategory]}
              </span>
            )}
            {listing.ai_identified && (
              <span className="badge badge-violet">🤖 Identifié par IA</span>
            )}
          </div>

          {/* Titre + Prix */}
          <div>
            <h1 className="font-syne font-extrabold text-2xl text-ink mb-2">{listing.title}</h1>
            {listing.type === "don" ? (
              <span className="font-syne font-bold text-2xl text-emerald">Gratuit</span>
            ) : listing.price != null ? (
              <div className="flex items-baseline gap-2">
                <span className="font-syne font-bold text-2xl text-ink">
                  {listing.price.toLocaleString("fr-FR")} €
                </span>
                {listing.is_negotiable && (
                  <span className="font-space text-sm text-ink/40">Prix négociable</span>
                )}
              </div>
            ) : null}
          </div>

          {/* Localisation + stats */}
          <div className="flex items-center gap-4 text-sm font-space text-ink/50">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {listing.city}
              {listing.department && ` (${listing.department})`}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {listing.views_count} vue{listing.views_count !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: fr })}
            </span>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="pt-3 border-t border-sand">
              <h2 className="font-syne font-bold text-base text-ink mb-2">Description</h2>
              <p className="font-space text-sm text-ink/70 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {/* Caractéristiques animal */}
          {listing.category === "animal" && (
            <div className="pt-3 border-t border-sand">
              <h2 className="font-syne font-bold text-base text-ink mb-3">Caractéristiques</h2>
              <div className="grid grid-cols-2 gap-3">
                {listing.animal_name && (
                  <div className="bg-warm rounded-xl px-3 py-2.5">
                    <div className="text-xs font-space text-ink/40 mb-0.5">Nom</div>
                    <div className="font-space font-semibold text-sm text-ink">{listing.animal_name}</div>
                  </div>
                )}
                {listing.animal_age != null && (
                  <div className="bg-warm rounded-xl px-3 py-2.5">
                    <div className="text-xs font-space text-ink/40 mb-0.5">Âge</div>
                    <div className="font-space font-semibold text-sm text-ink">
                      {listing.animal_age < 12
                        ? `${listing.animal_age} mois`
                        : `${Math.floor(listing.animal_age / 12)} an${Math.floor(listing.animal_age / 12) > 1 ? "s" : ""}`}
                    </div>
                  </div>
                )}
                {listing.animal_sex && (
                  <div className="bg-warm rounded-xl px-3 py-2.5">
                    <div className="text-xs font-space text-ink/40 mb-0.5">Sexe</div>
                    <div className="font-space font-semibold text-sm text-ink capitalize">{listing.animal_sex}</div>
                  </div>
                )}
                {listing.animal_breed && (
                  <div className="bg-warm rounded-xl px-3 py-2.5">
                    <div className="text-xs font-space text-ink/40 mb-0.5">Race</div>
                    <div className="font-space font-semibold text-sm text-ink">{listing.animal_breed}</div>
                  </div>
                )}
              </div>

              {/* Badges santé */}
              <div className="flex flex-wrap gap-2 mt-3">
                {listing.is_vaccinated && (
                  <span className="flex items-center gap-1.5 badge bg-emerald/10 text-emerald">
                    <CheckCircle className="w-3 h-3" /> Vacciné
                  </span>
                )}
                {listing.is_sterilized && (
                  <span className="flex items-center gap-1.5 badge bg-teal-l text-teal">
                    <CheckCircle className="w-3 h-3" /> Stérilisé
                  </span>
                )}
                {listing.has_lof && (
                  <span className="flex items-center gap-1.5 badge bg-violet-l text-violet">
                    <CheckCircle className="w-3 h-3" /> LOF / Pedigree
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Habitat */}
          {listing.habitat && (
            <div className="pt-3 border-t border-sand">
              <h2 className="font-syne font-bold text-base text-ink mb-2">Habitat / Contenant</h2>
              <span className="badge bg-teal-l text-teal">
                {HABITAT_LABELS[listing.habitat]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Colonne droite — vendeur + CTA */}
      <div className="space-y-4">

        {/* Card vendeur */}
        <div className="bg-white rounded-2xl border border-sand p-5">
          <h3 className="font-syne font-bold text-base text-ink mb-4">Vendeur</h3>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={48} height={48} className="rounded-full object-cover" />
              ) : (
                <span className="font-syne font-bold text-orange text-lg">
                  {(profile?.display_name ?? profile?.username ?? "U")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="font-space font-semibold text-ink">
                {profile?.display_name ?? profile?.username}
                {profile?.is_verified && (
                  <CheckCircle className="inline w-3.5 h-3.5 text-teal ml-1.5 -mt-0.5" />
                )}
              </div>
              <div className="text-xs font-space text-ink/40">
                {profile?.listings_count} annonce{profile?.listings_count !== 1 ? "s" : ""}
                {profile?.rating_avg > 0 && ` · ⭐ ${profile.rating_avg.toFixed(1)}`}
              </div>
            </div>
          </div>

          <div className="text-xs font-space text-ink/40 mb-4">
            Membre depuis {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy", { locale: fr }) : "—"}
          </div>

          {/* CTA contact */}
          {user ? (
            user.id !== listing.user_id ? (
              <Link
                href={`/messages?listing=${listing.id}&user=${listing.user_id}`}
                className="btn-primary w-full text-center flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Contacter le vendeur
              </Link>
            ) : (
              <Link href="/mes-annonces" className="btn-secondary w-full text-center text-sm">
                Gérer mon annonce
              </Link>
            )
          ) : (
            <Link href="/connexion" className="btn-primary w-full text-center">
              Connexion pour contacter
            </Link>
          )}

          {/* Signaler */}
          {user && user.id !== listing.user_id && (
            <button className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs font-space text-ink/30 hover:text-red-400 transition-colors py-1.5">
              <Flag className="w-3 h-3" />
              Signaler cette annonce
            </button>
          )}
        </div>

        {/* Localisation */}
        <div className="bg-white rounded-2xl border border-sand p-5">
          <h3 className="font-syne font-bold text-base text-ink mb-3">Localisation</h3>
          <div className="flex items-center gap-2 font-space text-sm text-ink/70">
            <MapPin className="w-4 h-4 text-teal shrink-0" />
            <span>{listing.city}{listing.postal_code && ` (${listing.postal_code})`}</span>
          </div>
          {listing.lat && listing.lng && (
            <div className="mt-3 h-32 bg-teal-l rounded-xl flex items-center justify-center text-teal/60 font-space text-sm">
              🗺️ Carte disponible
            </div>
          )}
        </div>

        {/* Sécurité */}
        <div className="bg-warm rounded-2xl border border-sand p-4">
          <h4 className="font-space font-semibold text-sm text-ink mb-2">🛡️ Conseils de sécurité</h4>
          <ul className="space-y-1.5 font-space text-xs text-ink/50">
            <li>• Rencontrez le vendeur en lieu public</li>
            <li>• Vérifiez l&apos;animal ou la plante avant l&apos;achat</li>
            <li>• Ne payez jamais à l&apos;avance</li>
            <li>• Méfiez-vous des prix trop bas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
