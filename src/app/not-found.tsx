import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🐾</div>
        <h1 className="font-syne font-extrabold text-4xl text-ink mb-3">404</h1>
        <h2 className="font-syne font-bold text-xl text-ink mb-4">Page introuvable</h2>
        <p className="font-space text-ink/50 text-sm mb-8">
          Cette page n&apos;existe pas ou a été déplacée. L&apos;animal a peut-être trouvé un foyer !
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
          </Link>
          <Link href="/annonces" className="btn-secondary">
            Voir les annonces
          </Link>
        </div>
      </div>
    </div>
  );
}
