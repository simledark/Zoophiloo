"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStore } from "@/store";
import { getBrowserClient } from "@/lib/supabase/client";
import {
  ANIMAL_SUBCATEGORIES, PLANT_SUBCATEGORIES, HABITAT_TYPES, LISTING_TYPES,
  ANIMAL_EMOJIS, PLANT_EMOJIS, HABITAT_EMOJIS, TYPE_EMOJIS,
  ANIMAL_LABELS, PLANT_LABELS, HABITAT_LABELS, TYPE_LABELS, APP_CONFIG
} from "@/types";
import { cn } from "@/lib/utils";
import { Upload, X, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from "lucide-react";

const schema = z.object({
  category: z.enum(["animal", "plante"]),
  type: z.enum(["vente", "don", "echange", "adoption"]),
  animal_subcategory: z.string().optional(),
  plant_subcategory: z.string().optional(),
  habitat: z.string().optional(),
  title: z.string().min(3, "Minimum 3 caractères").max(100, "Maximum 100 caractères"),
  description: z.string().max(3000).optional(),
  price: z.coerce.number().min(0).optional(),
  is_negotiable: z.boolean().default(false),
  city: z.string().min(2, "Ville requise"),
  postal_code: z.string().optional(),
  // Animal
  animal_name: z.string().optional(),
  animal_age: z.coerce.number().min(0).optional(),
  animal_breed: z.string().optional(),
  animal_sex: z.enum(["male", "femelle", "inconnu"]).optional(),
  is_vaccinated: z.boolean().optional(),
  is_sterilized: z.boolean().optional(),
  has_lof: z.boolean().default(false),
  // Plante
  plant_size: z.enum(["petit", "moyen", "grand", "tres_grand"]).optional(),
  plant_age_years: z.coerce.number().min(0).optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = ["Catégorie", "Détails", "Photos", "Localisation", "Récap"];

export function PublishForm() {
  const router = useRouter();
  const { user } = useStore();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "animal", type: "vente", is_negotiable: false, has_lof: false },
  });

  const category = watch("category");
  const type = watch("type");
  const animalSub = watch("animal_subcategory");
  const plantSub = watch("plant_subcategory");

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, APP_CONFIG.maxPhotosPerListing - photos.length);
    setPhotos((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setUploading(true);
    setError(null);
    const supabase = getBrowserClient();

    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from(APP_CONFIG.storageBucket)
          .upload(path, photo, { cacheControl: "3600", upsert: false });
        if (!uploadErr) photoUrls.push(path);
      }

      // Créer l'annonce
      const { data: listing, error: insertErr } = await supabase
        .from("listings")
        .insert({
          user_id: user.id,
          category: data.category,
          type: data.type,
          animal_subcategory: data.category === "animal" ? data.animal_subcategory ?? null : null,
          plant_subcategory: data.category === "plante" ? data.plant_subcategory ?? null : null,
          habitat: data.habitat ?? null,
          title: data.title,
          description: data.description ?? null,
          price: data.type === "don" ? null : data.price ?? null,
          is_negotiable: data.is_negotiable,
          photos: photoUrls,
          primary_photo: photoUrls[0] ?? null,
          city: data.city,
          postal_code: data.postal_code ?? null,
          animal_name: data.animal_name ?? null,
          animal_age: data.animal_age ?? null,
          animal_breed: data.animal_breed ?? null,
          animal_sex: data.animal_sex ?? null,
          is_vaccinated: data.is_vaccinated ?? null,
          is_sterilized: data.is_sterilized ?? null,
          has_lof: data.has_lof,
          plant_size: data.plant_size ?? null,
          plant_age_years: data.plant_age_years ?? null,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      router.push(`/annonces/${listing.id}?published=1`);
    } catch (e: any) {
      setError(e.message ?? "Une erreur est survenue.");
    } finally {
      setUploading(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-space font-bold transition-all",
                i < step ? "bg-emerald text-white" :
                i === step ? "bg-orange text-white" :
                "bg-sand text-ink/30"
              )}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn(
                "text-xs font-space mt-1 hidden sm:block",
                i === step ? "text-orange font-semibold" : "text-ink/30"
              )}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-1", i < step ? "bg-emerald" : "bg-sand")} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-2xl border border-sand p-6 min-h-[400px]">

          {/* ÉTAPE 0 — Catégorie */}
          {step === 0 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-syne font-bold text-lg text-ink">Que voulez-vous publier ?</h2>

              <div className="grid grid-cols-2 gap-3">
                {(["animal", "plante"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue("category", cat)}
                    className={cn(
                      "p-6 rounded-2xl border-2 text-center transition-all",
                      category === cat
                        ? "border-orange bg-orange/5"
                        : "border-sand hover:border-orange/30"
                    )}
                  >
                    <span className="text-4xl block mb-2">{cat === "animal" ? "🐾" : "🌿"}</span>
                    <span className="font-space font-semibold text-ink capitalize">{cat === "animal" ? "Animal" : "Plante"}</span>
                  </button>
                ))}
              </div>

              <div>
                <h3 className="font-space font-semibold text-sm text-ink mb-3">
                  {category === "animal" ? "Espèce" : "Type de plante"}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {(category === "animal" ? ANIMAL_SUBCATEGORIES : PLANT_SUBCATEGORIES).map((sub) => {
                    const emoji = category === "animal" ? ANIMAL_EMOJIS[sub as any] : PLANT_EMOJIS[sub as any];
                    const label = category === "animal" ? ANIMAL_LABELS[sub as any] : PLANT_LABELS[sub as any];
                    const current = category === "animal" ? animalSub : plantSub;
                    const field = category === "animal" ? "animal_subcategory" : "plant_subcategory";
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setValue(field as any, sub)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
                          current === sub
                            ? "border-orange bg-orange/5"
                            : "border-sand hover:border-orange/30"
                        )}
                      >
                        <span className="text-2xl">{emoji}</span>
                        <span className="font-space text-xs text-ink/70 leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-space font-semibold text-sm text-ink mb-3">Type d&apos;annonce</h3>
                <div className="grid grid-cols-2 gap-2">
                  {LISTING_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue("type", t)}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border transition-all",
                        type === t ? "border-orange bg-orange/5" : "border-sand hover:border-orange/30"
                      )}
                    >
                      <span className="text-xl">{TYPE_EMOJIS[t]}</span>
                      <span className="font-space font-medium text-sm text-ink">{TYPE_LABELS[t]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 1 — Détails */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-syne font-bold text-lg text-ink">Détails de l&apos;annonce</h2>

              <div>
                <label className="block font-space text-sm font-medium text-ink mb-1.5">
                  Titre <span className="text-red-400">*</span>
                </label>
                <input {...register("title")} className="input-base" placeholder="Ex: Magnifique Maine Coon 3 mois" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block font-space text-sm font-medium text-ink mb-1.5">Description</label>
                <textarea
                  {...register("description")}
                  className="input-base resize-none"
                  rows={5}
                  placeholder="Décrivez votre annonce en détail..."
                />
              </div>

              {type !== "don" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-space text-sm font-medium text-ink mb-1.5">Prix (€)</label>
                    <input {...register("price")} type="number" min={0} className="input-base" placeholder="0" />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input {...register("is_negotiable")} type="checkbox" className="w-4 h-4 accent-orange" />
                      <span className="font-space text-sm text-ink/70">Négociable</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Champs spécifiques animaux */}
              {category === "animal" && (
                <div className="pt-4 border-t border-sand space-y-4">
                  <h3 className="font-space font-semibold text-sm text-ink">Informations animal</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-space text-xs text-ink/60 mb-1">Prénom</label>
                      <input {...register("animal_name")} className="input-base text-sm py-2" placeholder="Ex: Luna" />
                    </div>
                    <div>
                      <label className="block font-space text-xs text-ink/60 mb-1">Âge (mois)</label>
                      <input {...register("animal_age")} type="number" min={0} className="input-base text-sm py-2" placeholder="Ex: 6" />
                    </div>
                    <div>
                      <label className="block font-space text-xs text-ink/60 mb-1">Race</label>
                      <input {...register("animal_breed")} className="input-base text-sm py-2" placeholder="Ex: Maine Coon" />
                    </div>
                    <div>
                      <label className="block font-space text-xs text-ink/60 mb-1">Sexe</label>
                      <select {...register("animal_sex")} className="input-base text-sm py-2">
                        <option value="">Choisir</option>
                        <option value="male">Mâle</option>
                        <option value="femelle">Femelle</option>
                        <option value="inconnu">Inconnu</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { field: "is_vaccinated", label: "💉 Vacciné(e)" },
                      { field: "is_sterilized", label: "✂️ Stérilisé(e)" },
                      { field: "has_lof", label: "📜 LOF / Pedigree" },
                    ].map((item) => (
                      <label key={item.field} className="flex items-center gap-2 cursor-pointer">
                        <input {...register(item.field as any)} type="checkbox" className="w-4 h-4 accent-orange" />
                        <span className="font-space text-sm text-ink/70">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Habitat */}
              <div>
                <label className="block font-space text-sm font-medium text-ink mb-2">
                  {category === "animal" ? "Habitat / Logement" : "Contenant"}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {HABITAT_TYPES.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setValue("habitat", h)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all",
                        watch("habitat") === h ? "border-orange bg-orange/5" : "border-sand hover:border-orange/30"
                      )}
                    >
                      <span className="text-xl">{HABITAT_EMOJIS[h]}</span>
                      <span className="font-space text-xs text-ink/60 leading-tight">{HABITAT_LABELS[h]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Champs spécifiques plantes */}
              {category === "plante" && (
                <div className="pt-4 border-t border-sand space-y-4">
                  <h3 className="font-space font-semibold text-sm text-ink">Informations plante</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-space text-xs text-ink/60 mb-1">Taille</label>
                      <select {...register("plant_size")} className="input-base text-sm py-2">
                        <option value="">Choisir</option>
                        <option value="petit">Petit (&lt;30cm)</option>
                        <option value="moyen">Moyen (30-80cm)</option>
                        <option value="grand">Grand (80-150cm)</option>
                        <option value="tres_grand">Très grand (&gt;150cm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-space text-xs text-ink/60 mb-1">Âge (années)</label>
                      <input {...register("plant_age_years")} type="number" min={0} className="input-base text-sm py-2" placeholder="Ex: 2" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 2 — Photos */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="font-syne font-bold text-lg text-ink">Photos</h2>
                <p className="font-space text-sm text-ink/50 mt-1">
                  Ajoutez jusqu&apos;à {APP_CONFIG.maxPhotosPerListing} photos. La première sera la photo principale.
                </p>
              </div>

              {/* Zone upload */}
              <label className={cn(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all",
                photos.length >= APP_CONFIG.maxPhotosPerListing
                  ? "border-sand opacity-50 cursor-not-allowed"
                  : "border-sand hover:border-orange/50 hover:bg-orange/2"
              )}>
                <Upload className="w-8 h-8 text-ink/30" />
                <div className="text-center">
                  <p className="font-space font-medium text-sm text-ink/60">Cliquez ou glissez vos photos</p>
                  <p className="font-space text-xs text-ink/30 mt-1">JPG, PNG, WebP — max 5 Mo chacune</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={photos.length >= APP_CONFIG.maxPhotosPerListing}
                  onChange={(e) => addPhotos(e.target.files)}
                />
              </label>

              {/* Aperçus */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {photoPreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute top-1.5 left-1.5 bg-orange text-white text-[10px] font-space font-bold px-2 py-0.5 rounded-full">
                          Principal
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-ink/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 3 — Localisation */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-syne font-bold text-lg text-ink">Localisation</h2>

              <div>
                <label className="block font-space text-sm font-medium text-ink mb-1.5">
                  Ville <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("city")}
                  className="input-base"
                  placeholder="Ex: Lyon, Bordeaux, Paris..."
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>

              <div>
                <label className="block font-space text-sm font-medium text-ink mb-1.5">Code postal</label>
                <input
                  {...register("postal_code")}
                  className="input-base"
                  placeholder="Ex: 75001"
                  maxLength={5}
                />
              </div>

              <div className="bg-teal-l rounded-2xl p-4 flex gap-3">
                <span className="text-xl shrink-0">🗺️</span>
                <div>
                  <p className="font-space font-semibold text-sm text-teal mb-1">Géolocalisation automatique</p>
                  <p className="font-space text-xs text-teal/70">
                    Votre annonce apparaîtra sur la carte interactive selon votre ville.
                    La géolocalisation précise est disponible dans la version Pro.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 — Récap */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-syne font-bold text-lg text-ink">Récapitulatif</h2>

              <div className="space-y-3">
                {[
                  { label: "Catégorie", value: category === "animal" ? "🐾 Animal" : "🌿 Plante" },
                  { label: "Type", value: `${TYPE_EMOJIS[type]} ${TYPE_LABELS[type]}` },
                  { label: "Titre", value: watch("title") || "—" },
                  { label: "Prix", value: type === "don" ? "Gratuit" : watch("price") ? `${watch("price")} €` : "—" },
                  { label: "Ville", value: watch("city") || "—" },
                  { label: "Photos", value: `${photos.length} photo${photos.length !== 1 ? "s" : ""}` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-sand last:border-0">
                    <span className="font-space text-sm text-ink/50">{item.label}</span>
                    <span className="font-space font-semibold text-sm text-ink">{item.value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-space px-4 py-3 rounded-xl">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className={cn("btn-secondary flex items-center gap-2", step === 0 && "invisible")}
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex items-center gap-2"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publication...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Publier l&apos;annonce</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
