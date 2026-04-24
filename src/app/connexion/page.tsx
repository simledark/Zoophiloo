"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getBrowserClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function ConnexionPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);

    const supabase = getBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      // Redirection vers homepage sans passer par le middleware
      window.location.replace("/");
    }
  };

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
          <h1 className="font-syne font-extrabold text-2xl text-ink mb-1">Connexion</h1>
          <p className="font-space text-sm text-ink/50 mb-6">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="text-orange hover:text-orange-d font-medium transition-colors">
              S&apos;inscrire
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-space text-sm font-medium text-ink mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                className="input-base"
                placeholder="vous@exemple.fr"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-space">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block font-space text-sm font-medium text-ink mb-1.5">Mot de passe</label>
              <input
                {...register("password")}
                type="password"
                className="input-base"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-space">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-space px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
