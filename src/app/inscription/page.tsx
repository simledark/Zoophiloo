"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getBrowserClient } from "@/lib/supabase/client";

const signupSchema = z.object({
  email: z.string().email("Email invalide"),
  username: z
    .string()
    .min(3, "Minimum 3 caractères")
    .max(30, "Maximum 30 caractères")
    .regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et _ uniquement"),
  password: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function InscriptionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    setError(null);
    const supabase = getBrowserClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { username: data.username },
      },
    });

    if (error) {
      if (error.message.includes("already")) {
        setError("Cet email est déjà utilisé.");
      } else {
        setError(error.message);
      }
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center bg-white rounded-2xl border border-sand p-8 shadow-card">
          <span className="text-5xl mb-4 block">📧</span>
          <h1 className="font-syne font-extrabold text-2xl text-ink mb-2">Vérifiez vos emails</h1>
          <p className="font-space text-sm text-ink/60 mb-6">
            Un lien de confirmation vous a été envoyé. Cliquez dessus pour activer votre compte.
          </p>
          <Link href="/connexion" className="btn-primary">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-orange rounded-[10px] flex items-center justify-center">
            <span className="font-syne font-extrabold text-white text-2xl">Z</span>
          </div>
          <span className="font-space font-bold text-xl">
            <span className="text-ink">Zoo</span>
            <span className="text-orange">philoo</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl border border-sand p-8 shadow-card">
          <h1 className="font-syne font-extrabold text-2xl text-ink mb-1">Créer un compte</h1>
          <p className="font-space text-sm text-ink/50 mb-6">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-orange hover:text-orange-d font-medium transition-colors">
              Se connecter
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-space text-sm font-medium text-ink mb-1.5">Email</label>
              <input {...register("email")} type="email" className="input-base" placeholder="vous@exemple.fr" />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-space">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block font-space text-sm font-medium text-ink mb-1.5">Pseudo</label>
              <input {...register("username")} type="text" className="input-base" placeholder="mon_pseudo" />
              {errors.username && <p className="text-red-500 text-xs mt-1 font-space">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block font-space text-sm font-medium text-ink mb-1.5">Mot de passe</label>
              <input {...register("password")} type="password" className="input-base" placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-space">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block font-space text-sm font-medium text-ink mb-1.5">Confirmer</label>
              <input {...register("confirmPassword")} type="password" className="input-base" placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-space">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-space px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
