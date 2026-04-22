// ============================================================
// ZOOPHILOO — Types Supabase Database (stub)
// Générer les types réels avec :
//   npx supabase gen types typescript --project-id eowyydqlqpdjvmaibnuv > src/types/database.ts
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          city?: string | null;
          department?: string | null;
          lat?: number | null;
          lng?: number | null;
          is_verified?: boolean;
          is_banned?: boolean;
          rating_avg?: number;
          rating_count?: number;
          listings_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          category: "animal" | "plante";
          type: "vente" | "don" | "echange" | "adoption";
          status: "actif" | "vendu" | "archive" | "supprime";
          animal_subcategory: string | null;
          plant_subcategory: string | null;
          habitat: string | null;
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
          animal_name: string | null;
          animal_age: number | null;
          animal_breed: string | null;
          animal_sex: string | null;
          is_vaccinated: boolean | null;
          is_sterilized: boolean | null;
          has_lof: boolean;
          has_lice: boolean;
          plant_size: string | null;
          plant_age_years: number | null;
          ai_identified: boolean;
          ai_species: string | null;
          ai_confidence: number | null;
          views_count: number;
          favorites_count: number;
          created_at: string;
          updated_at: string;
          expires_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["listings"]["Row"],
          "id" | "created_at" | "updated_at" | "views_count" | "favorites_count"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          views_count?: number;
          favorites_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          listing_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          status: "envoye" | "lu";
          is_deleted_by_sender: boolean;
          is_deleted_by_receiver: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      favoris: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["favoris"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["favoris"]["Insert"]>;
      };
      ratings: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewed_id: string;
          listing_id: string | null;
          score: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ratings"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ratings"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      listing_type: "vente" | "don" | "echange" | "adoption";
      listing_status: "actif" | "vendu" | "archive" | "supprime";
      listing_category: "animal" | "plante";
      animal_subcategory:
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
      plant_subcategory:
        | "plante"
        | "plante_ext"
        | "plante_carn"
        | "cactus"
        | "orchidee"
        | "bonsai"
        | "aquatique"
        | "graine";
      habitat_type:
        | "terrarium"
        | "aquarium"
        | "vivarium"
        | "paludarium"
        | "cage"
        | "pot"
        | "exterieur"
        | "ecurie";
    };
  };
}
