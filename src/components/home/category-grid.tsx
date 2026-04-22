import Link from "next/link";
import { ANIMAL_EMOJIS, PLANT_EMOJIS } from "@/types";

const ANIMAL_CATS = [
  { key: "chien", label: "Chiens" },
  { key: "chat", label: "Chats" },
  { key: "oiseau", label: "Oiseaux" },
  { key: "reptile", label: "Reptiles" },
  { key: "poisson", label: "Poissons" },
  { key: "rongeur", label: "Rongeurs" },
  { key: "lapin", label: "Lapins" },
  { key: "insecte", label: "Insectes" },
] as const;

const PLANT_CATS = [
  { key: "plante", label: "Intérieur" },
  { key: "cactus", label: "Cactus" },
  { key: "orchidee", label: "Orchidées" },
  { key: "plante_carn", label: "Carnivores" },
  { key: "bonsai", label: "Bonsaïs" },
  { key: "aquatique", label: "Aquatiques" },
] as const;

export function CategoryGrid() {
  return (
    <section className="container-app py-10">
      {/* Animaux */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">🐾 Animaux</h2>
          <Link href="/annonces?category=animal" className="text-sm font-space font-medium text-orange hover:text-orange-d transition-colors">
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {ANIMAL_CATS.map((cat) => (
            <Link
              key={cat.key}
              href={`/annonces?category=animal&animal=${cat.key}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-sand hover:border-orange/40 hover:shadow-card transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {ANIMAL_EMOJIS[cat.key]}
              </span>
              <span className="font-space text-xs font-medium text-ink/70 text-center leading-tight">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Plantes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">🌿 Plantes</h2>
          <Link href="/annonces?category=plante" className="text-sm font-space font-medium text-orange hover:text-orange-d transition-colors">
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {PLANT_CATS.map((cat) => (
            <Link
              key={cat.key}
              href={`/annonces?category=plante&plante=${cat.key}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-sand hover:border-lime-d/40 hover:shadow-card transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {PLANT_EMOJIS[cat.key]}
              </span>
              <span className="font-space text-xs font-medium text-ink/70 text-center leading-tight">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bannière type d'annonce */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
        {[
          { type: "vente", emoji: "💰", label: "Vente", color: "bg-orange/8 border-orange/20 hover:bg-orange/12", text: "text-orange-d" },
          { type: "don", emoji: "💚", label: "Don gratuit", color: "bg-emerald/8 border-emerald/20 hover:bg-emerald/12", text: "text-emerald" },
          { type: "echange", emoji: "🔄", label: "Échange", color: "bg-teal-l border-teal/20 hover:bg-teal/10", text: "text-teal" },
          { type: "adoption", emoji: "🏠", label: "Adoption", color: "bg-violet-l border-violet/20 hover:bg-violet/10", text: "text-violet" },
        ].map((item) => (
          <Link
            key={item.type}
            href={`/annonces?type=${item.type}`}
            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${item.color}`}
          >
            <span className="text-xl">{item.emoji}</span>
            <span className={`font-space font-semibold text-sm ${item.text}`}>{item.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
