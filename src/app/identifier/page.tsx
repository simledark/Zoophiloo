import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AIIdentifierPage } from "@/components/ai/ai-identifier-page";

export default function IdentifierPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app py-8">
        <AIIdentifierPage />
      </main>
      <Footer />
    </div>
  );
}
