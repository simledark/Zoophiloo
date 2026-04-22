import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "./listing-card";
import type { SearchFilters, Listing } from "@/types";
import Link from "next/link";

interface Props {
  filters: SearchFilters;
}

export async function ListingsGrid({ filters }: Props) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*, profiles(id, username, display_name, avatar_url, city)", { count: "exact" })
    .eq("status", "actif");

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.animal_subcategory) query = query.eq("animal_subcategory", filters.animal_subcategory);
  if (filters.plant_subcategory) query = query.eq("plant_subcategory", filters.plant_subcategory);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.query) {
    query = query.textSearch(
      "fts",
      filters.query,
      { type: "websearch", config: "french" }
    );
  }

  const sortField = filters.sort_by === "price_asc" || filters.sort_by === "price_desc"
    ? "price"
    : filters.sort_by ?? "created_at";
  const ascending = filters.sort_by === "price_asc";
  query = query.order(sortField, { ascending });

  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 24;
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data: listings, count } = await query;

  const total = count ?? 0;
  const hasMore = page * perPage < total;

  // Titre de la page
  let pageTitle = "Toutes les annonces";
  if (filters.query) pageTitle = `Résultats pour "${filters.query}"`;
  else if (filters.category === "animal") pageTitle = "🐾 Animaux";
  else if (filters.category === "plante") pageTitle = "🌿 Plantes";

  return (
    <div>
      {/* Header résultats */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-syne font-extrabold text-xl text-ink">{pageTitle}</h1>
          <p className="font-space text-sm text-ink/50 mt-0.5">
            {total.toLocaleString("fr-FR")} annonce{total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tri */}
        <select
          className="input-base w-auto text-sm py-2"
          defaultValue={filters.sort_by ?? "created_at"}
        >
          <option value="created_at">Plus récentes</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="views_count">Plus vues</option>
        </select>
      </div>

      {/* Grille */}
      {!listings || listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-sand">
          <span className="text-5xl mb-4 block">🔍</span>
          <h2 className="font-syne font-bold text-lg text-ink mb-2">Aucun résultat</h2>
          <p className="font-space text-sm text-ink/50 mb-6">
            Essayez d&apos;élargir votre recherche ou de changer les filtres.
          </p>
          <Link href="/annonces" className="btn-primary">
            Voir toutes les annonces
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {(listings as Listing[]).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {(hasMore || page > 1) && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}`}
                  className="btn-secondary text-sm"
                >
                  ← Précédent
                </Link>
              )}
              {hasMore && (
                <Link
                  href={`?page=${page + 1}`}
                  className="btn-secondary text-sm"
                >
                  Suivant →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
