import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucune photo fournie" }, { status: 400 });
    }

    // Convertir en base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              {
                type: "text",
                text: `Analyse cette image et identifie l'animal ou la plante.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "category": "animal" ou "plante",
  "subcategory": une valeur parmi [chien, chat, oiseau, reptile, poisson, insecte, papillon, phasme, rongeur, lapin, amphibien, autre] pour animal, ou [plante, plante_ext, plante_carn, cactus, orchidee, bonsai, aquatique, graine] pour plante,
  "species": "nom scientifique si connu, sinon nom commun",
  "common_name": "nom commun en français",
  "confidence": nombre entre 0 et 1,
  "description": "description courte en français (2-3 phrases)",
  "care_tips": ["conseil 1", "conseil 2", "conseil 3"],
  "estimated_price_range": {"min": 0, "max": 0}
}
Si tu ne peux pas identifier d'animal ou de plante, retourne: {"error": "Aucun animal ou plante détecté"}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: "Erreur API Claude" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    try {
      const result = JSON.parse(text);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ error: "Réponse IA invalide" }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
