"use client";

import { AIIdentifier } from "./ai-identifier";
import type { AIIdentificationResult } from "@/types";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import Link from "next/link";

export function AIIdentifierPage() {
  const router = useRouter();

  const handleResult = (result: AIIdentificationResult) => {
    const params = new URLSearchParams({ category: result.category, subcategory: result.subcategory, ai: "1" });
    router.push(`/publier?${params.toString()}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-l rounded-full mb-5">
          <Leaf className="w-4 h-4 text-teal" />
          <span className="font-space font-semibold text-sm text-teal">Propulsé par iNaturalist — Gratuit</span>
        </div>
        <h1 className="font-syne font-extrabold text-3xl text-ink mb-3">
          Identifiez votre animal ou plante
        </h1>
        <p className="font-space text-ink/60 text-base max-w-md mx-auto">
          Prenez une photo, iNaturalist l&apos;analyse parmi plus de 300 000 espèces et vous donne le nom, des conseils et une estimation de prix.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-sand p-6 shadow-card mb-6">
        <AIIdentifier onResult={handleResult} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { emoji: "🎯", title: "300 000+ espèces", desc: "Base de données collaborative mondiale" },
          { emoji: "⚡", title: "Instantané", desc: "Résultat en quelques secondes" },
          { emoji: "💚", title: "100% gratuit", desc: "Aucune clé API requise" },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl border border-sand p-4 text-center">
            <span className="text-2xl block mb-2">{f.emoji}</span>
            <p className="font-space font-semibold text-xs text-ink mb-1">{f.title}</p>
            <p className="font-space text-xs text-ink/40">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="font-space text-sm text-ink/40 mb-3">Vous avez identifié votre espèce ?</p>
        <Link href="/publier" className="btn-primary">Publier une annonce →</Link>
      </div>
    </div>
  );
}
