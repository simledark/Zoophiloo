-- ============================================================
--  ZOOPHILOO — Schéma Supabase complet
--  Coller dans : Supabase Dashboard > SQL Editor > New query
--  Puis cliquer sur "Run"
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── TYPES ÉNUMÉRÉS ──────────────────────────────────────

create type listing_type as enum ('vente', 'don', 'echange');
create type listing_status as enum ('active', 'vendu', 'reserve', 'supprime');

create type animal_type as enum (
  -- Animaux
  'chien', 'chat', 'oiseau', 'reptile', 'poisson',
  'insecte', 'papillon', 'phasme', 'rongeur',
  'lapin', 'amphibien', 'autre',
  -- Plantes
  'plante', 'plante_ext', 'plante_carn',
  'cactus', 'orchidee', 'bonsai', 'aquatique', 'graine'
);

create type habitat_type as enum (
  'terrarium', 'aquarium', 'vivarium', 'paludarium',
  'cage', 'pot', 'exterieur', 'ecurie'
);

-- ─── TABLE PROFILES ──────────────────────────────────────

create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  prenom              text not null default '',
  nom                 text not null default '',
  telephone           text,
  date_naissance      date,
  -- Adresse complète
  adresse_ligne1      text,
  adresse_ligne2      text,
  code_postal         text,
  ville               text,
  departement         text,
  pays                text not null default 'France',
  -- Coordonnées GPS (géocodées depuis l'adresse)
  lat                 double precision,
  lng                 double precision,
  -- Profil
  bio                 text,
  avatar_url          text,
  -- Statut : particulier, éleveur ou horticulteur pro
  eleveur             boolean not null default false,
  siret               text,
  -- Préférences
  notifications_email boolean not null default true,
  -- Stats
  nb_annonces         int not null default 0,
  -- Timestamps
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Sécurité RLS
alter table public.profiles enable row level security;

create policy "Lecture publique des profils"
  on public.profiles for select using (true);

create policy "Insertion de son propre profil"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Modification de son propre profil"
  on public.profiles for update using (auth.uid() = id);

-- ─── TABLE LISTINGS ──────────────────────────────────────

create table public.listings (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  -- Contenu
  titre             text not null,
  description       text,
  type_annonce      listing_type not null,
  animal            animal_type not null,
  race              text,        -- race / espèce / variété
  habitat           habitat_type,
  age_animal        text,        -- âge / taille / stade (bouture, etc.)
  prix              numeric(10,2) not null default 0,
  -- Photos (URLs Supabase Storage, max 8)
  photos            text[] not null default '{}',
  -- Localisation
  adresse_display   text,        -- ex: "Lyon 69003" (public)
  lat               double precision,
  lng               double precision,
  -- Statut & stats
  statut            listing_status not null default 'active',
  vues              int not null default 0,
  nb_favoris        int not null default 0,
  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  expires_at        timestamptz default (now() + interval '60 days')
);

-- Index performance
create index listings_statut_idx   on public.listings (statut);
create index listings_animal_idx   on public.listings (animal);
create index listings_type_idx     on public.listings (type_annonce);
create index listings_user_idx     on public.listings (user_id);
create index listings_created_idx  on public.listings (created_at desc);
create index listings_location_idx on public.listings (lat, lng);

-- Sécurité RLS
alter table public.listings enable row level security;

create policy "Lecture des annonces actives"
  on public.listings for select using (statut = 'active');

create policy "Création par utilisateur connecté"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Modification par propriétaire"
  on public.listings for update using (auth.uid() = user_id);

create policy "Suppression par propriétaire"
  on public.listings for delete using (auth.uid() = user_id);

-- ─── TABLE MESSAGES ──────────────────────────────────────

create table public.messages (
  id                uuid primary key default uuid_generate_v4(),
  listing_id        uuid not null references public.listings(id) on delete cascade,
  expediteur_id     uuid not null references public.profiles(id) on delete cascade,
  destinataire_id   uuid not null references public.profiles(id) on delete cascade,
  contenu           text not null,
  lu                boolean not null default false,
  created_at        timestamptz not null default now(),
  -- On ne peut pas s'envoyer un message à soi-même
  constraint no_self_message check (expediteur_id <> destinataire_id)
);

create index messages_listing_idx      on public.messages (listing_id);
create index messages_expediteur_idx   on public.messages (expediteur_id);
create index messages_destinataire_idx on public.messages (destinataire_id);
create index messages_created_idx      on public.messages (created_at desc);

alter table public.messages enable row level security;

create policy "Lecture de ses propres messages"
  on public.messages for select
  using (auth.uid() = expediteur_id or auth.uid() = destinataire_id);

create policy "Envoi de messages"
  on public.messages for insert
  with check (auth.uid() = expediteur_id);

create policy "Marquer comme lu"
  on public.messages for update
  using (auth.uid() = destinataire_id);

-- ─── TABLE FAVORIS ───────────────────────────────────────

create table public.favoris (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index favoris_user_idx    on public.favoris (user_id);
create index favoris_listing_idx on public.favoris (listing_id);

alter table public.favoris enable row level security;

create policy "Gestion de ses favoris"
  on public.favoris for all using (auth.uid() = user_id);

-- ─── TRIGGERS & FONCTIONS ────────────────────────────────

-- 1. Créer le profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, prenom, nom)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    coalesce(new.raw_user_meta_data->>'nom', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Mettre à jour updated_at automatiquement
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 3. Incrémenter le compteur d'annonces du profil
create or replace function public.update_nb_annonces()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles
    set nb_annonces = nb_annonces + 1
    where id = new.user_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles
    set nb_annonces = greatest(0, nb_annonces - 1)
    where id = old.user_id;
  end if;
  return null;
end;
$$;

create trigger listings_nb_annonces
  after insert or delete on public.listings
  for each row execute function public.update_nb_annonces();

-- 4. Compteur de favoris sur l'annonce
create or replace function public.update_nb_favoris()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.listings
    set nb_favoris = nb_favoris + 1
    where id = new.listing_id;
  elsif TG_OP = 'DELETE' then
    update public.listings
    set nb_favoris = greatest(0, nb_favoris - 1)
    where id = old.listing_id;
  end if;
  return null;
end;
$$;

create trigger favoris_count
  after insert or delete on public.favoris
  for each row execute function public.update_nb_favoris();

-- ─── STORAGE ─────────────────────────────────────────────
-- À créer manuellement dans Supabase Dashboard > Storage :
--
-- 1. Cliquez "New bucket"
-- 2. Nom : animal-photos
-- 3. Public : OUI (cochez la case)
-- 4. Allowed MIME types : image/jpeg, image/png, image/webp
-- 5. Max upload size : 10 MB
--
-- Politique storage (Dashboard > Storage > Policies) :
-- INSERT : (storage.foldername(name))[1] = auth.uid()::text
-- DELETE : (storage.foldername(name))[1] = auth.uid()::text
-- SELECT : true (public)

-- ─── VÉRIFICATION ────────────────────────────────────────
-- Après avoir exécuté ce script, vérifiez dans
-- Database > Tables que vous voyez bien :
--   profiles / listings / messages / favoris
-- Et dans Auth > Triggers que le trigger existe bien.
