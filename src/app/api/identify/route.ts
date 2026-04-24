import { NextRequest, NextResponse } from "next/server";

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

function refineSubcategory(taxonName: string, commonName: string, base: { category: "animal" | "plante"; subcategory: string }) {
  const n = (taxonName + " " + commonName).toLowerCase();
  if (base.category === "animal") {
    if (n.match(/canis|chien|dog|labrador|berger|golden|husky|bulldog|caniche|chihuahua/)) return { ...base, subcategory: "chien" };
    if (n.match(/felis|chat|cat|siamois|maine coon|persan|bengal|ragdoll/)) return { ...base, subcategory: "chat" };
    if (n.match(/psittac|parrot|perroquet|perruche|canari|cacatoes|pinson/)) return { ...base, subcategory: "oiseau" };
    if (n.match(/gecko|iguana|serpent|snake|lezard|lizard|tortue|turtle|cameleon|python|boa/)) return { ...base, subcategory: "reptile" };
    if (n.match(/fish|poisson|guppy|betta|goldfish|carpe|discus|neon|tetra/)) return { ...base, subcategory: "poisson" };
    if (n.match(/phasme|stick insect|phyllie/)) return { ...base, subcategory: "phasme" };
    if (n.match(/papillon|butterfly|morpho|monarch/)) return { ...base, subcategory: "papillon" };
    if (n.match(/insect|fourmi|ant|blatte|mante|scarabee|beetle/)) return { ...base, subcategory: "insecte" };
    if (n.match(/rat|souris|mouse|hamster|gerbille|cochon|guinea|chinchilla/)) return { ...base, subcategory: "rongeur" };
    if (n.match(/lapin|rabbit|lievre|hare/)) return { ...base, subcategory: "lapin" };
    if (n.match(/grenouille|frog|salamandre|triton|crapaud|toad|axolotl/)) return { ...base, subcategory: "amphibien" };
  }
  if (base.category === "plante") {
    if (n.match(/cactus|cactaceae|opuntia|cereus|mammillaria|succulent/)) return { ...base, subcategory: "cactus" };
    if (n.match(/orchid|orchidee|phalaenopsis|dendrobium/)) return { ...base, subcategory: "orchidee" };
    if (n.match(/bonsai/)) return { ...base, subcategory: "bonsai" };
    if (n.match(/carnivore|drosera|venus|dionaea|nepenthes|sarracenia/)) return { ...base, subcategory: "plante_carn" };
    if (n.match(/aquatic|aquatique|nenuphar|lotus|elodea|anubias/)) return { ...base, subcategory: "aquatique" };
    if (n.match(/graine|seed|bulbe|bulb/)) return { ...base, subcategory: "graine" };
  }
  return base;
}

function buildCareTips(sub: string): string[] {
  const tips: Record<string, string[]> = {
    chien: ["Sortie minimum 2x/jour", "Vaccination et vermifugation a jour", "Alimentation adaptee a la race et l age"],
    chat: ["Litiere a nettoyer regulierement", "Griffoir obligatoire", "Visite veterinaire annuelle"],
    oiseau: ["Cage spacieuse avec perchoirs varies", "Alimentation variee (graines, fruits)", "Interaction sociale quotidienne"],
    reptile: ["Terrarium avec gradient thermique", "Lampe UV-B indispensable", "Hygrometre adapte a l espece"],
    poisson: ["Qualite de l eau a surveiller (pH, nitrates)", "Filtration et oxygenation", "Alimentation 1-2x/jour sans exces"],
    insecte: ["Terrarium bien ventile", "Nourriture fraiche adaptee", "Temperature et humidite controlees"],
    phasme: ["Branches et feuilles fraiches", "Brumisation reguliere", "Eviter les courants d air"],
    papillon: ["Phase chenille : plante hote specifique", "Phase adulte : nectar de fleurs", "Respect du cycle de vie"],
    rongeur: ["Cage spacieuse avec roue", "Litiere absorbante a changer regulierement", "Eau fraiche disponible en permanence"],
    lapin: ["Foin a volonte (80% de l alimentation)", "Espace de vie minimum 6m2", "Sterilisation recommandee"],
    amphibien: ["Paludarium avec zone terrestre et aquatique", "Proies vivantes pour les carnivores", "Eau non chloree"],
    autre: ["Renseignez-vous sur les besoins specifiques", "Consultez un veterinaire specialise", "Respectez la legislation"],
    plante: ["Arrosage regulier sans exces", "Lumiere indirecte", "Rempotage au printemps si necessaire"],
    plante_ext: ["Arrosage selon la meteo", "Taille annuelle recommandee", "Protection hivernale si necessaire"],
    plante_carn: ["Eau de pluie ou osmosee uniquement", "Pas d engrais", "Lumiere directe minimum 4h/jour"],
    cactus: ["Arrosage tres espace (1x/mois en hiver)", "Plein soleil", "Sol drainant"],
    orchidee: ["Arrosage 1x/semaine en trempant le pot", "Lumiere vive sans soleil direct", "Engrais special orchidee"],
    bonsai: ["Arrosage quotidien en ete", "Taille et ligature regulieres", "Rempotage tous les 2-3 ans"],
    aquatique: ["Eau propre et bien oxygenee", "Eclairage 8-12h/jour", "Fertilisation liquide legere"],
    graine: ["Substrat approprie", "Humidite constante pour la germination", "Chaleur 18-25 C pour la levee"],
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

    // Envoyer en multipart a iNaturalist
    const inatForm = new FormData();
    inatForm.append("image", file, file.name);

    const inatResponse = await fetch("https://api.inaturalist.org/v1/computervision/score_image", {
      method: "POST",
      body: inatForm,
    });

    if (!inatResponse.ok) {
      return NextResponse.json({ error: "Service iNaturalist indisponible" }, { status: 502 });
    }

    const inatData = await inatResponse.json();
    const results = inatData.results ?? [];
    if (results.length === 0) return NextResponse.json({ error: "Aucune espece reconnue" });

    const best = results[0];
    const taxon = best.taxon;
    const score = best.combined_score ?? best.vision_score ?? 0.5;
    const iconicName = taxon.iconic_taxon_name ?? "";
    const base = TAXON_TO_CATEGORY[iconicName] ?? { category: "animal" as const, subcategory: "autre" };
    const commonName = taxon.preferred_common_name ?? taxon.english_common_name ?? taxon.name ?? "Espece inconnue";
    const refined = refineSubcategory(taxon.name ?? "", commonName, base);

    return NextResponse.json({
      category: refined.category,
      subcategory: refined.subcategory,
      species: taxon.name ?? "Espece inconnue",
      common_name: commonName,
      confidence: Math.round(score * 100) / 100,
      description: commonName + " (" + (taxon.name ?? "") + "). Identifie via iNaturalist.",
      care_tips: buildCareTips(refined.subcategory),
      estimated_price_range: estimatePrice(refined.subcategory),
      inaturalist_url: "https://www.inaturalist.org/taxa/" + taxon.id,
      alternatives: results.slice(1, 4).map((r: any) => ({
        name: r.taxon?.preferred_common_name ?? r.taxon?.name,
        score: Math.round((r.combined_score ?? r.vision_score ?? 0) * 100),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Erreur serveur" }, { status: 500 });
  }
}
