"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ANIMAL_EMOJIS, PLANT_EMOJIS, ANIMAL_SUBCATEGORIES, PLANT_SUBCATEGORIES, ANIMAL_LABELS, PLANT_LABELS, LISTING_TYPES, TYPE_LABELS, TYPE_EMOJIS } from "@/types";
import type { SearchFilters } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  filters: SearchFilters;
}

export function ListingsFilters({ filters }: Props) {
  const router = useRouter();
  const [priceMin, setPriceMin] = useState(filters.price_min?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(filters.price_max?.toString() ?? "");

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/annonces?${params.toString()}`);
  };

  const clearAll = () => router.push("/annonces");

  const hasFilters = filters.category || filters.type || filters.animal_subcategory || filters.plant_subcategory;

  return (
    <div className="space-y-5">
      {/* Header filtres */}
      <div className="flex items-center justify-between">
        <h3 className="font-syne font-bold text-base text-ink">Filtres</h3>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs font-space text-orange hover:text-orange-d transition-colors">
            Tout effacer
          </button>
        )}
      </div>

      {/* Catégorie */}
      <div className="bg-white rounded-2xl border border-sand p-4">
        <h4 className="font-space font-semibold text-sm text-ink mb-3">Catégorie</h4>
        <div className="space-y-1.5">
          {[
            { value: null, label: "Tout", emoji: "🏠" },
            { value: "animal", label: "Animaux", emoji: "🐾" },
            { value: "plante", label: "Plantes", emoji: "🌿" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => updateFilter("category", item.value)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-space transition-colors text-left",
                filters.category === item.value || (!filters.category && !item.value)
                  ? "bg-orange/10 text-orange-d font-semibold"
                  : "hover:bg-warm text-ink/70"
              )}
            >
              <span>{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type d'annonce */}
      <div className="bg-white rounded-2xl border border-sand p-4">
        <h4 className="font-space font-semibold text-sm text-ink mb-3">Type</h4>
        <div className="space-y-1.5">
          {LISTING_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => updateFilter("type", filters.type === type ? null : type)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-space transition-colors text-left",
                filters.type === type
                  ? "bg-orange/10 text-orange-d font-semibold"
                  : "hover:bg-warm text-ink/70"
              )}
            >
              <span>{TYPE_EMOJIS[type]}</span>
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Sous-catégories animaux */}
      {(!filters.category || filters.category === "animal") && (
        <div className="bg-white rounded-2xl border border-sand p-4">
          <h4 className="font-space font-semibold text-sm text-ink mb-3">🐾 Espèces</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {ANIMAL_SUBCATEGORIES.map((sub) => (
              <button
                key={sub}
                onClick={() => updateFilter("animal", filters.animal_subcategory === sub ? null : sub)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-space transition-colors text-left",
                  filters.animal_subcategory === sub
                    ? "bg-orange/10 text-orange-d font-semibold"
                    : "hover:bg-warm text-ink/60"
                )}
              >
                <span className="text-sm">{ANIMAL_EMOJIS[sub]}</span>
                {ANIMAL_LABELS[sub]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sous-catégories plantes */}
      {(!filters.category || filters.category === "plante") && (
        <div className="bg-white rounded-2xl border border-sand p-4">
          <h4 className="font-space font-semibold text-sm text-ink mb-3">🌿 Plantes</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {PLANT_SUBCATEGORIES.map((sub) => (
              <button
                key={sub}
                onClick={() => updateFilter("plante", filters.plant_subcategory === sub ? null : sub)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-space transition-colors text-left",
                  filters.plant_subcategory === sub
                    ? "bg-lime-d/20 text-lime-d font-semibold"
                    : "hover:bg-warm text-ink/60"
                )}
              >
                <span className="text-sm">{PLANT_EMOJIS[sub]}</span>
                {PLANT_LABELS[sub]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prix */}
      <div className="bg-white rounded-2xl border border-sand p-4">
        <h4 className="font-space font-semibold text-sm text-ink mb-3">Prix (€)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="input-base text-sm py-2 w-full"
            min={0}
          />
          <span className="text-ink/30 shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="input-base text-sm py-2 w-full"
            min={0}
          />
        </div>
        <button
          onClick={() => {
            if (priceMin) updateFilter("price_min", priceMin);
            if (priceMax) updateFilter("price_max", priceMax);
          }}
          className="btn-secondary text-sm w-full mt-2 py-2"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}
