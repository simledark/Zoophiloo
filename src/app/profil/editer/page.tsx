"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { getBrowserClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/layout/navbar";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Upload } from "lucide-react";

const schema = z.object({
  display_name: z.string().max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et _ uniquement"),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditerProfilPage() {
  const { user, profile, setProfile } = useStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const supabase = getBrowserClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        display_name: profile.display_name ?? "",
        username: profile.username,
        bio: profile.bio ?? "",
        phone: profile.phone ?? "",
        city: profile.city ?? "",
      });
    }
  }, [profile]);

  const handleAvatar = async (file: File) => {
    if (!user) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage
      .from("animal-photos")
      .upload(path, file, { upsert: true });

    if (!error) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/animal-photos/${path}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setSaving(true);
    const { data: updated, error } = await supabase
      .from("profiles")
      .update({
        display_name: data.display_name || null,
        username: data.username,
        bio: data.bio || null,
        phone: data.phone || null,
        city: data.city || null,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (!error && updated) {
      setProfile(updated as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container-app py-8">
        <div className="max-w-xl mx-auto">
          <h1 className="font-syne font-extrabold text-2xl text-ink mb-6">Mon profil</h1>

          <div className="bg-white rounded-2xl border border-sand p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-orange/10 flex items-center justify-center overflow-hidden">
                {avatarPreview || profile?.avatar_url ? (
                  <img
                    src={avatarPreview ?? profile?.avatar_url ?? ""}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-syne font-extrabold text-3xl text-orange">
                    {(profile?.display_name ?? profile?.username ?? "U")[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Changer la photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])}
                />
              </label>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-space text-sm font-medium text-ink mb-1.5">Prénom / Nom</label>
                  <input {...register("display_name")} className="input-base" placeholder="Jean Dupont" />
                </div>
                <div>
                  <label className="block font-space text-sm font-medium text-ink mb-1.5">
                    Pseudo <span className="text-red-400">*</span>
                  </label>
                  <input {...register("username")} className="input-base" placeholder="mon_pseudo" />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                </div>
              </div>

              <div>
                <label className="block font-space text-sm font-medium text-ink mb-1.5">Bio</label>
                <textarea
                  {...register("bio")}
                  className="input-base resize-none"
                  rows={3}
                  placeholder="Passionné de reptiles depuis 10 ans..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-space text-sm font-medium text-ink mb-1.5">Téléphone</label>
                  <input {...register("phone")} className="input-base" placeholder="06 12 34 56 78" />
                </div>
                <div>
                  <label className="block font-space text-sm font-medium text-ink mb-1.5">Ville</label>
                  <input {...register("city")} className="input-base" placeholder="Lyon" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                  ) : saved ? (
                    <><CheckCircle className="w-4 h-4" /> Enregistré !</>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-ghost text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
