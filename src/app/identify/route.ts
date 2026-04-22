import { NextRequest, NextResponse } from "next/server";

const INATURALIST_API = "https://api.inaturalist.org/v1";

const TAXON_TO_CATEGORY: Record<string, { category: "animal" | "plante"; subcategory: string }> = {
  Mammalia: { category: "animal", subcategory: "autre" },
  Aves: { category: "animal", subcategory: "oiseau" },
  Reptilia: { category: "animal", subcategory: "reptile" },
  Amphibia: { category: "animal", subcategory: "amphibien" },
  Actinopterygii: { category: "animal", subcategory: "poisson" },
  Insecta: { category: "animal", subcategory: "insecte" },
  Arachnida: { category: "animal", subcategory: "insecte" },
  Plantae: { category: "plante", subcategory: "plante" },
  Fungi: { category: "plante", subcategory: "plante" },
};

function refineSubcategory(
  taxonName: string,
  commonName: string,
  base: { category: "animal" | "plante"; subcategory: string }
): { category: "animal" | "plante"; subcategory: string } {
  const n = (taxonName + " " + commonName).toLowerCase();
  if (base.category === "animal") {
    if (n.match(/canis|chien|dog|labrador|berger|golden|husky|bulldog/)) return { ...base, subcategory: "chien" };
    if (n.match(/felis|chat|cat|siamois|maine coon|persan|bengal/)) return { ...base, subcategory: "chat" };
    if (n.match(/psittac|parrot|perroquet|perruche|canari|cacatoès/)) return { ...base, subcategory: "oiseau" };
    if (n.match(/gecko|iguana|serpent|snake|lézard|lizard|tortue|turtle|caméléon/)) return { ...base, subcategory: "reptile" };
    if (n.match(/fish|poisson|guppy|betta|goldfish|carpe|discus/)) return { ...base, subcategory: "poisson" };
    if (n.match(/phasme|stick insect|phyllie/)) return { ...base, subcategory: "phasme" };
    if (n.match(/papillon|butterfly|morpho/)) return { ...base, subcategory: "papillon" };
    if (n.match(/insect|fourmi|ant|blatte|mante|scarabée/)) return { ...base, subcategory: "insecte" };
    if (n.match(/rat|souris|hamster|gerbille|cochon d.inde|guinea/)) return { ...base, subcategory: "rongeur" };
    if (n.match(/lapin|rabbit|lièvre/)) return { ...base, subcategory: "lapin" };
    if (n.match(/grenouille|frog|salamandre|triton|crapaud/)) return { ...base, subcategory: "amphibien" };
  }
  if (base.category === "plante") {
    if (n.match(/cactus|cactaceae|opuntia|cereus|mammillaria/)) return { ...base, subcategory: "cactus" };
    if (n.match(/orchid|orchidée|phalaenopsis|dendrobium/)) return { ...base, subcategory: "orchidee" };
    if (n.match(/bonsai|bonsaï/)) return { ...base, subcategory: "bonsai" };
    if (n.match(/carnivore|drosera|venus|dionaea|nepenthes|sarracenia/)) return { ...base, subcategory: "plante_carn" };
    if (n.match(/aquatic|aquatique|nénuphar|lotus|elodea|anubias/)) return { ...base, subcategory: "aquatique" };
    if (n.match(/succulent|aloe|echeveria|haworthia/)) return { ...base, subcategory: "cactus" };
    if (n.match(/graine|seed|bulbe/)) return { ...base, subcategory: "graine" };
  }
  return base;
}

function buildCareTips(sub: string): string[] {
  const tips: Record<string, string[]> = {
    chien: ["Sortie minimum 2x/jour", "Vaccination et vermifugation à jour", "Alimentation adaptée à la race et l'âge"],
    chat: ["Litière à nettoyer régulièrement", "Griffoir obligatoire", "Visite vétérinaire annuelle"],
    oiseau: ["Cage spacieuse avec perchoirs variés", "Alimentation variée (graines, fruits)", "Interaction sociale quotidienne"],
    reptile: ["Terrarium avec gradient thermique", "Lampe UV-B indispensable", "Hygrométrie adaptée à l'espèce"],
    poisson: ["Qualité de l'eau à surveiller (pH, nitrates)", "Filtration et oxygénation", "Alimentation 1-2x/jour sans excès"],
    insecte: ["Terrarium bien ventilé", "Nourriture fraîche adaptée", "Température et humidité contrôlées"],
    phasme: ["Branches et feuilles fraîches", "Brumisation régulière", "Éviter les courants d'air"],
    papillon: ["Phase chenille : plante hôte spécifique", "Phase adulte : nectar de fleurs", "Respect du cycle de vie"],
    rongeur: ["Cage spacieuse avec roue", "Litière absorbante à changer régulièrement", "Alimentation variée et eau fraîche"],
    lapin: ["Foin à volonté (80% de l'alimentation)", "Espace de vie minimum 6m²", "Stérilisation recommandée"],
    amphibien: ["Paludarium avec zone terrestre et aquatique", "Proies vivantes pour les carnivores", "Eau non chlorée"],
    autre: ["Renseignez-vous sur les besoins spécifiques", "Consultez un vétérinaire spécialisé", "Respectez la législation"],
    plante: ["Arrosage régulier sans excès", "Lumière indirecte", "Rempotage au printemps si nécessaire"],
    plante_ext: ["Arrosage selon la météo", "Taille annuelle recommandée", "Protection hivernale si nécessaire"],
    plante_carn: ["Eau de pluie ou osmosée uniquement", "Pas d'engrais", "Lumière directe minimum 4h/jour"],
    cactus: ["Arrosage très espacé (1x/mois en hiver)", "Plein soleil", "Sol drainant"],
    orchidee: ["Arrosage 1x/semaine en trempant le pot", "Lumière vive sans soleil direct", "Engrais spécial orchidée"],
    bonsai: ["Arrosage quotidien en été", "Taille et ligature régulières", "Rempotage tous les 2-3 ans"],
    aquatique: ["Eau propre et bien oxygénée", "Éclairage 8-12h/jour", "Fertilisation liquide légère"],
    graine: ["Substrat approprié", "Humidité constante pour la germination", "Chaleur 18-25°C pour la levée"],
  };
  return tips[sub] ?? tips.autre;
}

function estimatePrice(sub: string): { min: number; max: number } {
  const prices: Record<string, { min: number; max: number }> = {
    chien: { min: 200, max: 2000 }, chat: { min: 100, max: 1500 },
    oiseau: { min: 20, max: 500 }, reptile: { min: 30, max: 800 },
    poisson: { min: 5, max: 200 }, insecte: { min: 5, max: 50 },
    phasme: { min: 5, max: 30 }, papillon: { min: 10, max: 50 },
    rongeur: { min: 10, max: 80 }, lapin: { min: 30, max: 150 },
    amphibien: { min: 10, max: 150 }, autre: { min: 10, max: 300 },
    plante: { min: 5, max: 80 }, plante_ext: { min: 10, max: 200 },
    plante_carn: { min: 8, max: 60 }, cactus: { min: 3, max: 50 },
    orchidee: { min: 10, max: 150 }, bonsai: { min: 20, max: 500 },
    aquatique: { min: 3, max: 40 }, graine: { min: 2, max: 20 },
  };
  return prices[sub] ?? { min: 10, max: 200 };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    if (!file) return NextResponse.json({ error: "Aucune photo fournie" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const inatResponse = await fetch(`${INATURALIST_API}/computervision/score_image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: dataUrl, locale: "fr" }),
    });

    if (!inatResponse.ok) {
      return NextResponse.json({ error: "Service iNaturalist indisponible" }, { status: 502 });
    }

    const inatData = await inatResponse.json();
    const results = inatData.results ?? [];
    if (results.length === 0) return NextResponse.json({ error: "Aucune espèce reconnue sur cette photo" });

    const best = results[0];
    const taxon = best.taxon;
    const score = best.combined_score ?? best.vision_score ?? 0.5;
    const iconicName = taxon.iconic_taxon_name ?? "";
    const base = TAXON_TO_CATEGORY[iconicName] ?? { category: "animal" as const, subcategory: "autre" };
    const commonName = taxon.preferred_common_name ?? taxon.english_common_name ?? taxon.name ?? "Espèce inconnue";
    const refined = refineSubcategory(taxon.name ?? "", commonName, base);

    return NextResponse.json({
      category: refined.category,
      subcategory: refined.subcategory,
      species: taxon.name ?? "Espèce inconnue",
      common_name: commonName,
      confidence: Math.round(score * 100) / 100,
      description: `${commonName} (${taxon.name ?? ""}). Identifié via iNaturalist, la plateforme collaborative de sciences naturelles.`,
      care_tips: buildCareTips(refined.subcategory),
      estimated_price_range: estimatePrice(refined.subcategory),
      inaturalist_url: `https://www.inaturalist.org/taxa/${taxon.id}`,
      alternatives: results.slice(1, 4).map((r: any) => ({
        name: r.taxon?.preferred_common_name ?? r.taxon?.name,
        score: Math.round((r.combined_score ?? r.vision_score ?? 0) * 100),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Erreur serveur" }, { status: 500 });
  }
}
