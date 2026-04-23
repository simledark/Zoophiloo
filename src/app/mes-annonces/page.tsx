import { Navbar } from "@/components/layout/navbar";
import { MesAnnonces } from "@/components/profile/mes-annonces";

export default function MesAnnoncesPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app py-8">
        <MesAnnonces />
      </main>
    </div>
  );
}
