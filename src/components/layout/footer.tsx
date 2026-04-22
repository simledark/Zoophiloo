import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-12">
      <div className="container-app py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Logo + desc */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-orange rounded-[8px] flex items-center justify-center">
                <span className="font-syne font-extrabold text-white text-lg">Z</span>
              </div>
              <span className="font-space font-bold text-white">
                Zoo<span className="text-orange">philoo</span>
              </span>
            </div>
            <p className="font-space text-sm text-white/50 leading-relaxed">
              La marketplace des passionnés d&apos;animaux et de plantes.
            </p>
          </div>

          {/* Animaux */}
          <div>
            <h4 className="font-syne font-bold text-white text-sm mb-3">Animaux</h4>
            <ul className="space-y-2 font-space text-sm">
              {["Chiens", "Chats", "Reptiles", "Oiseaux", "Rongeurs"].map((item) => (
                <li key={item}>
                  <Link href={`/annonces?category=animal&animal=${item.toLowerCase()}`} className="hover:text-orange transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Plantes */}
          <div>
            <h4 className="font-syne font-bold text-white text-sm mb-3">Plantes</h4>
            <ul className="space-y-2 font-space text-sm">
              {["Intérieur", "Extérieur", "Cactus", "Orchidées", "Bonsaïs"].map((item) => (
                <li key={item}>
                  <Link href="/annonces?category=plante" className="hover:text-orange transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="font-syne font-bold text-white text-sm mb-3">Aide</h4>
            <ul className="space-y-2 font-space text-sm">
              <li><Link href="/publier" className="hover:text-orange transition-colors">Publier une annonce</Link></li>
              <li><Link href="/connexion" className="hover:text-orange transition-colors">Connexion</Link></li>
              <li><Link href="/inscription" className="hover:text-orange transition-colors">Inscription</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-orange transition-colors">Mentions légales</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-space text-xs text-white/30">
            © {new Date().getFullYear()} Zoophiloo — Tous droits réservés
          </p>
          <p className="font-space text-xs text-white/30">
            Fait avec 🧡 pour les passionnés
          </p>
        </div>
      </div>
    </footer>
  );
}
