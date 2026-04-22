// ============================================================
// ZOOPHILOO — Types TypeScript Global
// ============================================================

// ============================================================
// ENUMS & UNION TYPES
// ============================================================

export type ListingType = "vente" | "don" | "echange" | "adoption";
export type ListingStatus = "actif" | "vendu" | "archive" | "supprime";
export type ListingCategory = "animal" | "plante";

export type AnimalSubcategory =
  | "chien"
  | "chat"
  | "oiseau"
  | "reptile"
  | "poisson"
  | "insecte"
  | "papillon"
  | "phasme"
  | "rongeur"
  | "lapin"
  | "amphibien"
  | "autre";

export type PlantSubcategory =
  | "plante"
  | "plante_ext"
  | "plante_carn"
  | "cactus"
  | "orchidee"
  | "bonsai"
  | "aquatique"
  | "graine";

export type HabitatType =
  | "terrarium"
  | "aquarium"
  | "vivarium"
  | "paludarium"
  | "cage"
  | "pot"
  | "exterieur"
  | "ecurie";

export type AnimalSex = "male" | "femelle" | "inconnu";
export type PlantSize = "petit" | "moyen" | "grand" | "tres_grand";
export type MessageStatus = "envoye" | "lu";
export type ReportReason = "fraude" | "inapproprie" | "doublon" | "autre";
export type NotificationType =
  | "message"
  | "favorite"
  | "rating"
  | "listing_expire"
  | "system";

// ============================================================
// CONSTANTES — EMOJIS
// ============================================================

export const ANIMAL_EMOJIS: Record<AnimalSubcategory, string> = {
  chien: "🐕",
  chat: "🐈",
  oiseau: "🐦",
  reptile: "🦎",
  poisson: "🐟",
  insecte: "🐛",
  papillon: "🦋",
  phasme: "🌿",
  rongeur: "🐭",
  lapin: "🐰",
  amphibien: "🐸",
  autre: "🐾",
} as const;

export const PLANT_EMOJIS: Record<PlantSubcategory, string> = {
  plante: "🪴",
  plante_ext: "🌳",
  plante_carn: "🌱",
  cactus: "🌵",
  orchidee: "🌸",
  bonsai: "🎋",
  aquatique: "🌊",
  graine: "🌾",
} as const;

export const HABITAT_EMOJIS: Record<HabitatType, string> = {
  terrarium: "🦎",
  aquarium: "🐠",
  vivarium: "🌿",
  paludarium: "💧",
  cage: "🪺",
  pot: "🪴",
  exterieur: "🌳",
  ecurie: "🐴",
} as const;

export const TYPE_EMOJIS: Record<ListingType, string> = {
  vente: "💰",
  don: "💚",
  echange: "🔄",
  adoption: "🏠",
} as const;

// ============================================================
// CONSTANTES — LABELS FRANÇAIS
// ============================================================

export const ANIMAL_LABELS: Record<AnimalSubcategory, string> = {
  chien: "Chien",
  chat: "Chat",
  oiseau: "Oiseau",
  reptile: "Reptile",
  poisson: "Poisson",
  insecte: "Insecte",
  papillon: "Papillon",
  phasme: "Phasme",
  rongeur: "Rongeur",
  lapin: "Lapin",
  amphibien: "Amphibien",
  autre: "Autre",
} as const;

export const PLANT_LABELS: Record<PlantSubcategory, string> = {
  plante: "Plante d'intérieur",
  plante_ext: "Plante d'extérieur",
  plante_carn: "Plante carnivore",
  cactus: "Cactus / Succulente",
  orchidee: "Orchidée",
  bonsai: "Bonsaï",
  aquatique: "Plante aquatique",
  graine: "Graine / Bulbe",
} as const;

export const HABITAT_LABELS: Record<HabitatType, string> = {
  terrarium: "Terrarium",
  aquarium: "Aquarium",
  vivarium: "Vivarium",
  paludarium: "Paludarium",
  cage: "Cage",
  pot: "Pot",
  exterieur: "Extérieur",
  ecurie: "Écurie / Box",
} as const;

export const TYPE_LABELS: Record<ListingType, string> = {
  vente: "Vente",
  don: "Don gratuit",
  echange: "Échange",
  adoption: "Adoption",
} as const;

export const PLANT_SIZE_LABELS: Record<PlantSize, string> = {
  petit: "Petit (< 30cm)",
  moyen: "Moyen (30-80cm)",
  grand: "Grand (80-150cm)",
  tres_grand: "Très grand (> 150cm)",
} as const;

// ============================================================
// CONSTANTES — COULEURS MARQUEURS CARTE
// ============================================================

export const MARKER_COLORS: Record<AnimalSubcategory | PlantSubcategory, string> = {
  // Animaux — tons chauds
  chien: "#ff8c42",
  chat: "#e06a1a",
  oiseau: "#f59e0b",
  reptile: "#10b981",
  poisson: "#0d9488",
  insecte: "#8b5cf6",
  papillon: "#ec4899",
  phasme: "#6ee7b7",
  rongeur: "#d97706",
  lapin: "#fbbf24",
  amphibien: "#34d399",
  autre: "#94a3b8",
  // Plantes — tons verts
  plante: "#22c55e",
  plante_ext: "#16a34a",
  plante_carn: "#dc2626",
  cactus: "#ca8a04",
  orchidee: "#a855f7",
  bonsai: "#84cc16",
  aquatique: "#0891b2",
  graine: "#78716c",
} as const;

// ============================================================
// CONSTANTES — URLs FICHES WIKIPEDIA / INFO
// ============================================================

export const FICHE_URLS: Record<AnimalSubcategory | PlantSubcategory, string> = {
  chien: "https://fr.wikipedia.org/wiki/Chien",
  chat: "https://fr.wikipedia.org/wiki/Chat_domestique",
  oiseau: "https://fr.wikipedia.org/wiki/Oiseau",
  reptile: "https://fr.wikipedia.org/wiki/Reptile",
  poisson: "https://fr.wikipedia.org/wiki/Poisson",
  insecte: "https://fr.wikipedia.org/wiki/Insecte",
  papillon: "https://fr.wikipedia.org/wiki/Lépidoptères",
  phasme: "https://fr.wikipedia.org/wiki/Phasmatodea",
  rongeur: "https://fr.wikipedia.org/wiki/Rongeur",
  lapin: "https://fr.wikipedia.org/wiki/Lapin_domestique",
  amphibien: "https://fr.wikipedia.org/wiki/Amphibien",
  autre: "https://fr.wikipedia.org/wiki/Animal",
  plante: "https://fr.wikipedia.org/wiki/Plante",
  plante_ext: "https://fr.wikipedia.org/wiki/Plante",
  plante_carn: "https://fr.wikipedia.org/wiki/Plante_carnivore",
  cactus: "https://fr.wikipedia.org/wiki/Cactaceae",
  orchidee: "https://fr.wikipedia.org/wiki/Orchidée",
  bonsai: "https://fr.wikipedia.org/wiki/Bonsaï",
  aquatique: "https://fr.wikipedia.org/wiki/Plante_aquatique",
  graine: "https://fr.wikipedia.org/wiki/Graine",
} as const;

// ============================================================
// INTERFACES — SUPABASE TABLES
// ============================================================

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  city: string | null;
  department: string | null;
  lat: number | null;
  lng: number | null;
  is_verified: boolean;
  is_banned: boolean;
  rating_avg: number;
  rating_count: number;
  listings_count: number;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  category: ListingCategory;
  type: ListingType;
  status: ListingStatus;
  animal_subcategory: AnimalSubcategory | null;
  plant_subcategory: PlantSubcategory | null;
  habitat: HabitatType | null;
  title: string;
  description: string | null;
  price: number | null;
  is_negotiable: boolean;
  photos: string[];
  primary_photo: string | null;
  city: string;
  department: string | null;
  postal_code: string | null;
  lat: number | null;
  lng: number | null;
  // Animal fields
  animal_name: string | null;
  animal_age: number | null;
  animal_breed: string | null;
  animal_sex: AnimalSex | null;
  is_vaccinated: boolean | null;
  is_sterilized: boolean | null;
  has_lof: boolean;
  has_lice: boolean;
  // Plant fields
  plant_size: PlantSize | null;
  plant_age_years: number | null;
  // IA
  ai_identified: boolean;
  ai_species: string | null;
  ai_confidence: number | null;
  // Stats
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  // Join
  profiles?: Profile;
}

export interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status: MessageStatus;
  is_deleted_by_sender: boolean;
  is_deleted_by_receiver: boolean;
  created_at: string;
  // Joins
  sender?: Profile;
  receiver?: Profile;
  listing?: Pick<Listing, "id" | "title" | "primary_photo" | "status">;
}

export interface Favori {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}

export interface Rating {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  listing_id: string | null;
  score: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// ============================================================
// TYPES — FORMULAIRES
// ============================================================

export interface ListingFormData {
  category: ListingCategory;
  type: ListingType;
  animal_subcategory?: AnimalSubcategory;
  plant_subcategory?: PlantSubcategory;
  habitat?: HabitatType;
  title: string;
  description?: string;
  price?: number;
  is_negotiable: boolean;
  photos: File[];
  city: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  // Animal
  animal_name?: string;
  animal_age?: number;
  animal_breed?: string;
  animal_sex?: AnimalSex;
  is_vaccinated?: boolean;
  is_sterilized?: boolean;
  has_lof?: boolean;
  // Plant
  plant_size?: PlantSize;
  plant_age_years?: number;
}

export interface ProfileFormData {
  username: string;
  display_name?: string;
  bio?: string;
  phone?: string;
  city?: string;
}

export interface MessageFormData {
  content: string;
}

// ============================================================
// TYPES — RECHERCHE & FILTRES
// ============================================================

export interface SearchFilters {
  query?: string;
  category?: ListingCategory;
  animal_subcategory?: AnimalSubcategory;
  plant_subcategory?: PlantSubcategory;
  type?: ListingType;
  city?: string;
  department?: string;
  price_min?: number;
  price_max?: number;
  radius_km?: number;
  lat?: number;
  lng?: number;
  animal_sex?: AnimalSex;
  is_vaccinated?: boolean;
  sort_by?: "created_at" | "price_asc" | "price_desc" | "views_count";
  page?: number;
  per_page?: number;
}

export interface SearchResult {
  listings: Listing[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// ============================================================
// TYPES — CARTE
// ============================================================

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  emoji: string;
  color: string;
  listing: Pick<Listing, "id" | "title" | "price" | "type" | "primary_photo" | "category" | "animal_subcategory" | "plant_subcategory">;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ============================================================
// TYPES — IA
// ============================================================

export interface AIIdentificationResult {
  species: string;
  common_name: string;
  confidence: number;
  category: ListingCategory;
  subcategory: AnimalSubcategory | PlantSubcategory;
  description: string;
  care_tips?: string[];
  estimated_price_range?: { min: number; max: number };
}

// ============================================================
// TYPES — CONVERSATION (messagerie groupée par annonce)
// ============================================================

export interface Conversation {
  listing: Pick<Listing, "id" | "title" | "primary_photo" | "status">;
  other_user: Profile;
  last_message: Message;
  unread_count: number;
}

// ============================================================
// TYPES — API RESPONSES
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// ============================================================
// CONSTANTES — CONFIG
// ============================================================

export const APP_CONFIG = {
  name: "Zoophiloo",
  tagline: "La marketplace des animaux et plantes près de chez vous",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "animal-photos",
  maxPhotosPerListing: 8,
  listingExpiryDays: 60,
  defaultRadius: 50,
  maxRadius: 200,
  pagination: {
    defaultPerPage: 24,
    maxPerPage: 100,
  },
} as const;

export const ANIMAL_SUBCATEGORIES: AnimalSubcategory[] = [
  "chien", "chat", "oiseau", "reptile", "poisson",
  "insecte", "papillon", "phasme", "rongeur",
  "lapin", "amphibien", "autre",
];

export const PLANT_SUBCATEGORIES: PlantSubcategory[] = [
  "plante", "plante_ext", "plante_carn",
  "cactus", "orchidee", "bonsai", "aquatique", "graine",
];

export const HABITAT_TYPES: HabitatType[] = [
  "terrarium", "aquarium", "vivarium", "paludarium",
  "cage", "pot", "exterieur", "ecurie",
];

export const LISTING_TYPES: ListingType[] = ["vente", "don", "echange", "adoption"];
