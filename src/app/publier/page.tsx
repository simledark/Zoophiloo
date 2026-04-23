import { Navbar } from "@/components/layout/navbar";
import { PublishForm } from "@/components/publish/publish-form";

export default function PublierPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-syne font-extrabold text-3xl text-ink mb-2">
              Publier une annonce
            </h1>
            <p className="font-space text-ink/50 text-sm">
              Remplissez le formulaire ci-dessous pour publier votre annonce gratuitement.
            </p>
          </div>
          <PublishForm />
        </div>
      </main>
    </div>
  );
}
