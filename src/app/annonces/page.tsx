import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ListingsGrid } from "@/components/listings/listings-grid";
import { ListingsFilters } from "@/components/listings/listings-filters";
import type { SearchFilters } from "@/types";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

function parseFilters(params: PageProps["searchParams"]): SearchFilters {
  return {
    query: typeof params.q === "string" ? params.q : undefined,
    category: params.category === "animal" || params.category === "plante" ? params.category : undefined,
    animal_subcategory: typeof params.animal === "string" ? (params.animal as any) : undefined,
    plant_subcategory: typeof params.plante === "string" ? (params.plante as any) : undefined,
    type: typeof params.type === "string" ? (params.type as any) : undefined,
    city: typeof params.city === "string" ? params.city : undefined,
    sort_by: typeof params.sort === "string" ? (params.sort as any) : "created_at",
    page: typeof params.page === "string" ? parseInt(params.page) : 1,
    per_page: 24,
  };
}

export default function AnnoncesPage({ searchParams }: PageProps) {
  const filters = parseFilters(searchParams);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app py-6">
        <div className="flex gap-6">
          {/* Filtres sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <ListingsFilters filters={filters} />
          </aside>

          {/* Grille annonces */}
          <div className="flex-1 min-w-0">
            <ListingsGrid filters={filters} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
