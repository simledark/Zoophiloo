import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app py-10">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-sand p-8">
          <h1 className="font-syne font-extrabold text-2xl text-ink mb-6">Mentions légales</h1>

          <div className="space-y-6 font-space text-sm text-ink/70 leading-relaxed">
            <section>
              <h2 className="font-syne font-bold text-base text-ink mb-2">Éditeur</h2>
              <p>Zoophiloo est une marketplace en ligne dédiée aux annonces d&apos;animaux et de plantes.</p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-base text-ink mb-2">Hébergement</h2>
              <p>Site hébergé par Netlify, Inc. — 512 2nd Street, Suite 200, San Francisco, CA 94107, USA.</p>
              <p className="mt-1">Base de données hébergée par Supabase.</p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-base text-ink mb-2">Données personnelles</h2>
              <p>
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression
                de vos données. Pour toute demande, contactez-nous via l&apos;interface du site.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-base text-ink mb-2">Cookies</h2>
              <p>
                Zoophiloo utilise uniquement des cookies techniques nécessaires au fonctionnement du site
                (authentification, session). Aucun cookie publicitaire n&apos;est utilisé.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-base text-ink mb-2">Responsabilité</h2>
              <p>
                Zoophiloo est une plateforme de mise en relation entre particuliers. Nous ne sommes pas
                responsables du contenu des annonces publiées par les utilisateurs. Toute transaction
                se fait sous la responsabilité des parties concernées.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-base text-ink mb-2">Animaux protégés</h2>
              <p>
                La vente d&apos;espèces protégées est strictement interdite. Tout utilisateur publiant
                une annonce s&apos;engage à respecter la législation en vigueur concernant la détention
                et la cession d&apos;animaux.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
