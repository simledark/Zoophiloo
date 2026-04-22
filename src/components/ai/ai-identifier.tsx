"use client";

import { useState, useRef } from "react";
import type { AIIdentificationResult } from "@/types";
import { Loader2, Upload, Leaf, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onResult?: (result: AIIdentificationResult) => void;
  className?: string;
}

export function AIIdentifier({ onResult, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Veuillez sélectionner une image."); return; }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setLoading(true); setError(null); setResult(null);
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await fetch("/api/identify", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setResult(data); onResult?.(data as AIIdentificationResult); }
    } catch { setError("Erreur de connexion. Réessayez."); }
    finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setError(null); setPreview(null); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-teal-l rounded-xl flex items-center justify-center">
          <Leaf className="w-4 h-4 text-teal" />
        </div>
        <div>
          <h3 className="font-syne font-bold text-base text-ink">Identification par photo</h3>
          <p className="font-space text-xs text-ink/50">
            Propulsé par{" "}
            <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">iNaturalist</a>
            {" "}— 100% gratuit
          </p>
        </div>
      </div>

      {!preview ? (
        <label
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-teal/30 bg-teal-l/30 cursor-pointer hover:bg-teal-l/50 transition-all"
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="w-12 h-12 bg-teal/10 rounded-2xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-teal" />
          </div>
          <div className="text-center">
            <p className="font-space font-semibold text-sm text-teal">Déposez une photo ici</p>
            <p className="font-space text-xs text-ink/40 mt-1">ou cliquez pour sélectionner</p>
            <p className="font-space text-xs text-ink/30 mt-1">JPG, PNG, WebP</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={preview} alt="Aperçu" className="w-full max-h-64 object-cover rounded-2xl" />
          {loading && (
            <div className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center gap-3 rounded-2xl">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <p className="font-space text-white text-sm font-medium">Analyse en cours...</p>
              <p className="font-space text-white/60 text-xs">Recherche dans 300 000+ espèces</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="font-space text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-teal-l rounded-2xl p-5 space-y-4 animate-slide-up">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-teal" />
                <span className="font-space text-xs font-semibold text-teal uppercase tracking-wide">Identifié par iNaturalist</span>
              </div>
              <h4 className="font-syne font-extrabold text-xl text-ink">{result.common_name}</h4>
              {result.species && result.species !== result.common_name && (
                <p className="font-space text-xs text-ink/50 italic mt-0.5">{result.species}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="font-syne font-bold text-2xl text-teal">{Math.round(result.confidence * 100)}%</div>
              <div className="font-space text-xs text-ink/40">confiance</div>
            </div>
          </div>

          <div className="h-1.5 bg-teal/20 rounded-full overflow-hidden">
            <div className="h-full bg-teal rounded-full" style={{ width: `${Math.round(result.confidence * 100)}%` }} />
          </div>

          {result.description && <p className="font-space text-sm text-ink/70 leading-relaxed">{result.description}</p>}

          {result.alternatives?.length > 0 && (
            <div className="bg-white/50 rounded-xl p-3">
              <p className="font-space text-xs text-ink/40 mb-2">Autres possibilités :</p>
              <div className="flex flex-wrap gap-2">
                {result.alternatives.map((alt: any, i: number) => (
                  <span key={i} className="badge bg-white text-ink/60 border border-teal/20">{alt.name} ({alt.score}%)</span>
                ))}
              </div>
            </div>
          )}

          {result.estimated_price_range?.max > 0 && (
            <div className="bg-white/60 rounded-xl px-4 py-3">
              <p className="font-space text-xs text-ink/50 mb-0.5">Prix estimé sur Zoophiloo</p>
              <p className="font-space font-semibold text-sm text-ink">
                {result.estimated_price_range.min} – {result.estimated_price_range.max} €
              </p>
            </div>
          )}

          {result.care_tips?.length > 0 && (
            <div>
              <p className="font-space text-xs font-semibold text-ink/50 uppercase tracking-wide mb-2">Conseils d&apos;entretien</p>
              <ul className="space-y-1.5">
                {result.care_tips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 font-space text-xs text-ink/70">
                    <span className="text-teal mt-0.5">•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.inaturalist_url && (
            <a href={result.inaturalist_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 font-space text-xs text-teal hover:underline">
              <ExternalLink className="w-3 h-3" />
              Voir la fiche complète sur iNaturalist
            </a>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={reset} className="btn-secondary text-sm flex-1 py-2">Analyser une autre photo</button>
            {onResult && (
              <button onClick={() => onResult(result as AIIdentificationResult)} className="btn-primary text-sm flex-1 py-2">
                Utiliser ces infos ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
