import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { RecentListings } from "@/components/home/recent-listings";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main>
        <Hero />
        <CategoryGrid />
        <RecentListings />
      </main>
      <Footer />
    </div>
  );
}
