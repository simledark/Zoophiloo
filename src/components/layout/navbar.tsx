"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/store";
import { Menu, X, Heart, MessageCircle, Bell, Plus, LogOut, User } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, unreadCount, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = getBrowserClient();
    await supabase.auth.signOut();
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-sand shadow-sm">
      <div className="container-app">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-9 h-9 bg-orange rounded-[10px] flex items-center justify-center overflow-hidden">
              <div className="absolute w-7 h-7 rounded-full bg-white/10 -top-2 -right-2" />
              <div className="absolute w-5 h-5 rounded-full bg-white/10 -bottom-1 -left-1" />
              <span className="relative font-syne font-extrabold text-white text-xl leading-none">Z</span>
            </div>
            <span className="font-space font-bold text-lg leading-none">
              <span className="text-ink">Zoo</span>
              <span className="text-orange">philoo</span>
            </span>
          </Link>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <Link
              href="/annonces"
              className="w-full flex items-center gap-3 px-4 py-2.5 bg-warm rounded-xl border border-sand hover:border-orange/50 transition-colors group"
            >
              <svg className="w-4 h-4 text-ink/40 group-hover:text-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-ink/40 font-space">Chercher un animal, une plante...</span>
            </Link>
          </div>

          {/* Nav droite */}
          <div className="flex items-center gap-2">
            {/* Bouton publier */}
            <Link
              href="/publier"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-xl font-space font-semibold text-sm hover:bg-orange-d transition-colors shadow-orange"
            >
              <Plus className="w-4 h-4" />
              Publier
            </Link>

            {user ? (
              <>
                {/* Favoris */}
                <Link href="/favoris" className="relative p-2 rounded-xl hover:bg-warm transition-colors">
                  <Heart className="w-5 h-5 text-ink/60" />
                </Link>

                {/* Messages */}
                <Link href="/messages" className="relative p-2 rounded-xl hover:bg-warm transition-colors">
                  <MessageCircle className="w-5 h-5 text-ink/60" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Avatar / menu user */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-warm transition-colors"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center">
                        <span className="text-orange font-bold text-sm">
                          {(profile?.display_name ?? profile?.username ?? "U")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-card-hover border border-sand p-1.5 z-50">
                      <Link
                        href="/profil"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-warm text-sm font-space transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-ink/50" />
                        Mon profil
                      </Link>
                      <Link
                        href="/mes-annonces"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-warm text-sm font-space transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 text-ink/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Mes annonces
                      </Link>
                      <div className="border-t border-sand my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm font-space text-red-500 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/connexion" className="btn-ghost text-sm">
                  Connexion
                </Link>
                <Link href="/inscription" className="btn-primary text-sm hidden sm:block">
                  Inscription
                </Link>
              </div>
            )}

            {/* Menu mobile */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-warm transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className="md:hidden border-t border-sand py-3 space-y-1 animate-fade-in">
            <Link href="/annonces" className="block px-4 py-2.5 rounded-xl hover:bg-warm font-space text-sm" onClick={() => setMenuOpen(false)}>
              🔍 Chercher
            </Link>
            <Link href="/annonces?category=animal" className="block px-4 py-2.5 rounded-xl hover:bg-warm font-space text-sm" onClick={() => setMenuOpen(false)}>
              🐾 Animaux
            </Link>
            <Link href="/annonces?category=plante" className="block px-4 py-2.5 rounded-xl hover:bg-warm font-space text-sm" onClick={() => setMenuOpen(false)}>
              🌿 Plantes
            </Link>
            <Link href="/publier" className="block px-4 py-2.5 rounded-xl bg-orange text-white font-space font-semibold text-sm text-center" onClick={() => setMenuOpen(false)}>
              + Publier une annonce
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
