"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const QUICK_SEARCHES = [
  { label: "🐕 Chiens", href: "/annonces?animal=chien" },
  { label: "🐈 Chats", href: "/annonces?animal=chat" },
  { label: "🦎 Reptiles", href: "/annonces?animal=reptile" },
  { label: "🌵 Cactus", href: "/annonces?plante=cactus" },
  { label: "💚 Dons", href: "/annonces?type=don" },
  { label: "🔄 Échanges", href: "/annonces?type=echange" },
];

export function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/annonces?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="bg-white border-b border-sand">
      <div className="container-app py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange/10 rounded-full mb-5">
            <span className="text-lg">🐾</span>
            <span className="text-sm font-space font-semibold text-orange-d">
              Animaux & Plantes près de chez vous
            </span>
          </div>

          {/* Titre */}
          <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-ink tracking-tight mb-4 leading-tight">
            Adoptez, échangez,{" "}
            <span className="text-orange">partagez</span>
          </h1>

          <p className="font-space text-ink/60 text-lg mb-8">
            La marketplace des passionnés — animaux et plantes, partout en France.
          </p>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 bg-warm rounded-xl border border-sand focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all">
              <svg className="w-5 h-5 text-ink/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Maine Coon, Monstera, Gecko..."
                className="flex-1 bg-transparent font-space text-ink placeholder:text-ink/40 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-orange text-white font-space font-semibold rounded-xl hover:bg-orange-d transition-colors shadow-orange shrink-0"
            >
              Rechercher
            </button>
          </form>

          {/* Recherches rapides */}
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_SEARCHES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-1.5 bg-warm border border-sand rounded-full font-space text-sm text-ink/70 hover:border-orange/40 hover:text-orange hover:bg-orange/5 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-10 pt-8 border-t border-sand">
          {[
            { value: "12 000+", label: "Annonces actives" },
            { value: "8 500+", label: "Passionnés" },
            { value: "100%", label: "Gratuit" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-syne font-extrabold text-xl text-orange">{stat.value}</div>
              <div className="font-space text-xs text-ink/50 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
