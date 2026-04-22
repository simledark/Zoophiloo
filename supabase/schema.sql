-- ============================================================
-- ZOOPHILOO — Schéma Supabase complet
-- Animaux + Plantes Marketplace
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- pour géolocalisation avancée (optionnel)

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE listing_type AS ENUM ('vente', 'don', 'echange', 'adoption');
CREATE TYPE listing_status AS ENUM ('actif', 'vendu', 'archive', 'supprime');
CREATE TYPE listing_category AS ENUM ('animal', 'plante');

-- Sous-catégories animaux
CREATE TYPE animal_subcategory AS ENUM (
  'chien', 'chat', 'oiseau', 'reptile', 'poisson',
  'insecte', 'papillon', 'phasme', 'rongeur',
  'lapin', 'amphibien', 'autre'
);

-- Sous-catégories plantes
CREATE TYPE plant_subcategory AS ENUM (
  'plante', 'plante_ext', 'plante_carn',
  'cactus', 'orchidee', 'bonsai', 'aquatique', 'graine'
);

-- Habitats / contenants
CREATE TYPE habitat_type AS ENUM (
  'terrarium', 'aquarium', 'vivarium', 'paludarium',
  'cage', 'pot', 'exterieur', 'ecurie'
);

CREATE TYPE message_status AS ENUM ('envoye', 'lu');
CREATE TYPE report_reason AS ENUM ('fraude', 'inapproprie', 'doublon', 'autre');

-- ============================================================
-- TABLE: profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL CHECK (length(username) BETWEEN 3 AND 30),
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT CHECK (length(bio) <= 500),
  phone         TEXT,
  city          TEXT,
  department    TEXT,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_banned     BOOLEAN DEFAULT FALSE,
  rating_avg    NUMERIC(3,2) DEFAULT 0,
  rating_count  INTEGER DEFAULT 0,
  listings_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: listings
-- ============================================================

CREATE TABLE IF NOT EXISTS listings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Classification
  category        listing_category NOT NULL,
  type            listing_type NOT NULL,
  status          listing_status DEFAULT 'actif',

  -- Sous-catégorie (l'une ou l'autre selon category)
  animal_subcategory  animal_subcategory,
  plant_subcategory   plant_subcategory,
  habitat             habitat_type,

  -- Contenu
  title           TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 100),
  description     TEXT CHECK (length(description) <= 3000),
  price           NUMERIC(10,2) CHECK (price >= 0),
  is_negotiable   BOOLEAN DEFAULT FALSE,

  -- Médias
  photos          TEXT[] DEFAULT '{}', -- URLs Supabase Storage
  primary_photo   TEXT,

  -- Géolocalisation
  city            TEXT NOT NULL,
  department      TEXT,
  postal_code     TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,

  -- Spécificités animal
  animal_name     TEXT,           -- nom de l'animal
  animal_age      INTEGER,        -- âge en mois
  animal_breed    TEXT,           -- race
  animal_sex      TEXT CHECK (animal_sex IN ('male', 'femelle', 'inconnu')),
  is_vaccinated   BOOLEAN,
  is_sterilized   BOOLEAN,
  has_lof         BOOLEAN DEFAULT FALSE,  -- LOF / pedigree
  has_lice        BOOLEAN DEFAULT FALSE,

  -- Spécificités plante
  plant_size      TEXT CHECK (plant_size IN ('petit', 'moyen', 'grand', 'tres_grand')),
  plant_age_years INTEGER,

  -- IA identification
  ai_identified   BOOLEAN DEFAULT FALSE,
  ai_species      TEXT,
  ai_confidence   NUMERIC(4,3),  -- 0.000 à 1.000

  -- Stats
  views_count     INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days'),

  -- Contraintes
  CONSTRAINT category_subcategory_check CHECK (
    (category = 'animal' AND animal_subcategory IS NOT NULL AND plant_subcategory IS NULL)
    OR
    (category = 'plante' AND plant_subcategory IS NOT NULL AND animal_subcategory IS NULL)
  ),
  CONSTRAINT price_type_check CHECK (
    (type = 'don' AND (price IS NULL OR price = 0))
    OR (type != 'don')
  )
);

-- ============================================================
-- TABLE: messages
-- ============================================================

CREATE TABLE IF NOT EXISTS messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  status        message_status DEFAULT 'envoye',
  is_deleted_by_sender   BOOLEAN DEFAULT FALSE,
  is_deleted_by_receiver BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT no_self_message CHECK (sender_id != receiver_id)
);

-- ============================================================
-- TABLE: favoris
-- ============================================================

CREATE TABLE IF NOT EXISTS favoris (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, listing_id)
);

-- ============================================================
-- TABLE: ratings
-- ============================================================

CREATE TABLE IF NOT EXISTS ratings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id    UUID REFERENCES listings(id) ON DELETE SET NULL,
  score         INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment       TEXT CHECK (length(comment) <= 500),
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(reviewer_id, listing_id),
  CONSTRAINT no_self_rating CHECK (reviewer_id != reviewed_id)
);

-- ============================================================
-- TABLE: reports
-- ============================================================

CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id  UUID REFERENCES listings(id) ON DELETE SET NULL,
  reason      report_reason NOT NULL,
  details     TEXT CHECK (length(details) <= 500),
  resolved    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL, -- 'message', 'favorite', 'rating', 'listing_expire', 'system'
  title       TEXT NOT NULL,
  body        TEXT,
  link        TEXT,          -- lien vers l'annonce ou conversation
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Listings : recherche principale
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_animal_sub ON listings(animal_subcategory) WHERE animal_subcategory IS NOT NULL;
CREATE INDEX idx_listings_plant_sub ON listings(plant_subcategory) WHERE plant_subcategory IS NOT NULL;
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price);
-- Géo : recherche par lat/lng (bounding box)
CREATE INDEX idx_listings_geo ON listings(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
-- Full-text search
CREATE INDEX idx_listings_fts ON listings USING gin(
  to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(animal_breed, '') || ' ' || coalesce(city, ''))
);

-- Messages
CREATE INDEX idx_messages_listing ON messages(listing_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Favoris
CREATE INDEX idx_favoris_user ON favoris(user_id);
CREATE INDEX idx_favoris_listing ON favoris(listing_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- Profiles
CREATE INDEX idx_profiles_geo ON profiles(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX idx_profiles_username ON profiles(username);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substring(NEW.id::text, 1, 8)
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Mise à jour du compteur de favoris sur listings
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings SET favorites_count = favorites_count + 1 WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings SET favorites_count = GREATEST(favorites_count - 1, 0) WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_favoris_count
  AFTER INSERT OR DELETE ON favoris
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- Mise à jour du compteur d'annonces sur profiles
CREATE OR REPLACE FUNCTION update_listings_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET listings_count = listings_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET listings_count = GREATEST(listings_count - 1, 0) WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listings_count
  AFTER INSERT OR DELETE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listings_count();

-- Recalcul de la note moyenne du profil
CREATE OR REPLACE FUNCTION update_rating_avg()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    rating_avg = (SELECT AVG(score) FROM ratings WHERE reviewed_id = COALESCE(NEW.reviewed_id, OLD.reviewed_id)),
    rating_count = (SELECT COUNT(*) FROM ratings WHERE reviewed_id = COALESCE(NEW.reviewed_id, OLD.reviewed_id))
  WHERE id = COALESCE(NEW.reviewed_id, OLD.reviewed_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rating_avg
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_rating_avg();

-- Notification auto quand nouveau message reçu
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  listing_title TEXT;
BEGIN
  SELECT display_name INTO sender_name FROM profiles WHERE id = NEW.sender_id;
  SELECT title INTO listing_title FROM listings WHERE id = NEW.listing_id;

  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    NEW.receiver_id,
    'message',
    'Nouveau message de ' || COALESCE(sender_name, 'quelqu''un'),
    'Concernant : ' || COALESCE(listing_title, 'une annonce'),
    '/messages/' || NEW.listing_id || '/' || NEW.sender_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
-- Lecture publique
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

-- Modification uniquement par le propriétaire
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ---- LISTINGS ----
-- Lecture : toutes les annonces actives publiques
CREATE POLICY "listings_select_public" ON listings
  FOR SELECT USING (status = 'actif' OR auth.uid() = user_id);

-- Création : uniquement si connecté
CREATE POLICY "listings_insert_auth" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Modification / suppression : uniquement le propriétaire
CREATE POLICY "listings_update_own" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "listings_delete_own" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- ---- MESSAGES ----
-- Lecture : expéditeur ou destinataire uniquement
CREATE POLICY "messages_select_participants" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "messages_insert_auth" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ---- FAVORIS ----
CREATE POLICY "favoris_select_own" ON favoris
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favoris_insert_own" ON favoris
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favoris_delete_own" ON favoris
  FOR DELETE USING (auth.uid() = user_id);

-- ---- RATINGS ----
CREATE POLICY "ratings_select_public" ON ratings
  FOR SELECT USING (true);

CREATE POLICY "ratings_insert_auth" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ---- REPORTS ----
CREATE POLICY "reports_insert_auth" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Lecture admin uniquement (via service_role)

-- ---- NOTIFICATIONS ----
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- REALTIME (activer pour messagerie)
-- ============================================================

-- À exécuter dans Supabase Dashboard > Database > Replication
-- ou via SQL :
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- STORAGE POLICIES (bucket: animal-photos)
-- ============================================================
-- À appliquer dans Supabase Dashboard > Storage > Policies

-- Lecture publique
-- CREATE POLICY "Public read" ON storage.objects
--   FOR SELECT USING (bucket_id = 'animal-photos');

-- Upload : utilisateurs connectés uniquement, dans leur dossier
-- CREATE POLICY "Auth upload" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'animal-photos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Suppression : uniquement le propriétaire
-- CREATE POLICY "Owner delete" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'animal-photos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================================
-- DONNÉES DE TEST (optionnel)
-- ============================================================
-- Décommentez pour insérer des données de démo
-- INSERT INTO listings (user_id, category, type, animal_subcategory, title, description, price, city, lat, lng)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000', -- remplacez par un vrai UUID
--   'animal', 'vente', 'chat',
--   'Chaton Maine Coon disponible',
--   'Magnifique chaton Maine Coon, 3 mois, vacciné, vermifugé.',
--   450, 'Paris', 48.8566, 2.3522
-- );
