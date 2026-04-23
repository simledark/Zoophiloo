"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store";
import { ANIMAL_EMOJIS, PLANT_EMOJIS, MARKER_COLORS, APP_CONFIG } from "@/types";
import type { Listing, MapMarker } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { X, MapPin, Filter } from "lucide-react";

interface Props {
  listings: Partial<Listing>[];
}

export function MapView({ listings }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const { mapCenter, mapZoom, setMapCenter, setMapZoom, selectedListingId, setSelectedListing } = useStore();
  const [selectedListing, setSelected] = useState<Partial<Listing> | null>(null);
  const [filter, setFilter] = useState<"all" | "animal" | "plante">("all");
  const [mapLoaded, setMapLoaded] = useState(false);

  const getEmoji = (listing: Partial<Listing>) => {
    if (listing.category === "animal" && listing.animal_subcategory) {
      return ANIMAL_EMOJIS[listing.animal_subcategory] ?? "🐾";
    }
    if (listing.category === "plante" && listing.plant_subcategory) {
      return PLANT_EMOJIS[listing.plant_subcategory] ?? "🌿";
    }
    return "📍";
  };

  const getColor = (listing: Partial<Listing>) => {
    const sub = listing.animal_subcategory ?? listing.plant_subcategory;
    if (sub && MARKER_COLORS[sub as keyof typeof MARKER_COLORS]) {
      return MARKER_COLORS[sub as keyof typeof MARKER_COLORS];
    }
    return "#ff8c42";
  };

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    // Import dynamique Leaflet (SSR-safe)
    import("leaflet").then((L) => {
      // Fix icônes Leaflet avec Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: mapCenter,
        zoom: mapZoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      map.on("moveend", () => {
        const c = map.getCenter();
        setMapCenter([c.lat, c.lng]);
        setMapZoom(map.getZoom());
      });

      leafletRef.current = { map, L };
      setMapLoaded(true);
    });

    return () => {
      if (leafletRef.current?.map) {
        leafletRef.current.map.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  // Mettre à jour les marqueurs quand listings ou filtre change
  useEffect(() => {
    if (!leafletRef.current || !mapLoaded) return;
    const { map, L } = leafletRef.current;

    // Supprimer anciens marqueurs
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const filtered = listings.filter((l) =>
      l.lat != null && l.lng != null && (filter === "all" || l.category === filter)
    );

    filtered.forEach((listing) => {
      const emoji = getEmoji(listing);
      const color = getColor(listing);

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          font-size: 1.75rem;
          line-height: 1;
          cursor: pointer;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
          transition: transform 0.15s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid ${color};
        "><span style="transform: rotate(45deg); display: block;">${emoji}</span></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([listing.lat!, listing.lng!], { icon })
        .addTo(map)
        .on("click", () => {
          setSelected(listing as Partial<Listing>);
          setSelectedListing(listing.id ?? null);
        });

      markersRef.current.push(marker);
    });
  }, [listings, filter, mapLoaded]);

  const filteredCount = listings.filter(
    (l) => l.lat != null && (filter === "all" || l.category === filter)
  ).length;

  const photoUrl = (path: string | null | undefined) =>
    path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${APP_CONFIG.storageBucket}/${path}` : null;

  return (
    <div className="relative" style={{ height: "calc(100vh - 64px)" }}>
      {/* Import CSS Leaflet */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* Carte */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Contrôles filtres */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white rounded-2xl shadow-card border border-sand p-2 flex gap-1">
          {[
            { value: "all", label: "Tout", emoji: "🏠" },
            { value: "animal", label: "Animaux", emoji: "🐾" },
            { value: "plante", label: "Plantes", emoji: "🌿" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as any)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-space font-medium transition-all",
                filter === item.value
                  ? "bg-orange text-white"
                  : "text-ink/60 hover:bg-warm"
              )}
            >
              <span>{item.emoji}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-card border border-sand px-3 py-2">
          <span className="font-space text-xs text-ink/50">
            <MapPin className="w-3 h-3 inline mr-1" />
            {filteredCount} annonce{filteredCount !== 1 ? "s" : ""} sur la carte
          </span>
        </div>
      </div>

      {/* Popup annonce sélectionnée */}
      {selectedListing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-72 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-card-hover border border-sand overflow-hidden">
            <div className="relative">
              {/* Bouton fermer */}
              <button
                onClick={() => { setSelected(null); setSelectedListing(null); }}
                className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Photo */}
              <div className="h-28 bg-warm relative">
                {photoUrl(selectedListing.primary_photo) ? (
                  <Image
                    src={photoUrl(selectedListing.primary_photo)!}
                    alt={selectedListing.title ?? ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {getEmoji(selectedListing)}
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="p-3.5">
                <h3 className="font-space font-semibold text-sm text-ink line-clamp-1 mb-1">
                  {selectedListing.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="font-syne font-bold text-base text-ink">
                    {selectedListing.type === "don" ? (
                      <span className="text-emerald">Gratuit</span>
                    ) : selectedListing.price != null ? (
                      `${selectedListing.price.toLocaleString("fr-FR")} €`
                    ) : "—"}
                  </span>
                  <span className="font-space text-xs text-ink/40">{selectedListing.city}</span>
                </div>
                <Link
                  href={`/annonces/${selectedListing.id}`}
                  className="btn-primary w-full text-center text-sm py-2 mt-3 block"
                >
                  Voir l&apos;annonce
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
