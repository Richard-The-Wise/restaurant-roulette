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
      restaurants: {
        Row: {
          id: string;
          user_id: string;
          list_id: string;
          google_place_id: string | null;
          google_maps_url: string | null;
          name: string;
          category: string;
          cuisine_type: string | null;
          opening_hours: Json | null;
          rating: number | null;
          price_level: number | null;
          visit_count: number;
          last_visited: string | null;
          notes: string | null;
          is_favorite: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          list_id: string;
          google_place_id?: string | null;
          google_maps_url?: string | null;
          name: string;
          category: string;
          cuisine_type?: string | null;
          opening_hours?: Json | null;
          rating?: number | null;
          price_level?: number | null;
          visit_count?: number;
          last_visited?: string | null;
          notes?: string | null;
          is_favorite?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          list_id?: string;
          google_place_id?: string | null;
          google_maps_url?: string | null;
          name?: string;
          category?: string;
          cuisine_type?: string | null;
          opening_hours?: Json | null;
          rating?: number | null;
          price_level?: number | null;
          visit_count?: number;
          last_visited?: string | null;
          notes?: string | null;
          is_favorite?: boolean;
          tags?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      google_places_cache: {
        Row: {
          google_place_id: string;
          google_maps_url: string | null;
          name: string;
          category: string;
          cuisine_type: string | null;
          opening_hours: Json | null;
          rating: number | null;
          price_level: number | null;
          photo_name: string | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          google_place_id: string;
          google_maps_url?: string | null;
          name: string;
          category: string;
          cuisine_type?: string | null;
          opening_hours?: Json | null;
          rating?: number | null;
          price_level?: number | null;
          photo_name?: string | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          google_maps_url?: string | null;
          name?: string;
          category?: string;
          cuisine_type?: string | null;
          opening_hours?: Json | null;
          rating?: number | null;
          price_level?: number | null;
          photo_name?: string | null;
          photo_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurant_lists: {
        Row: {
          id: string;
          created_by: string;
          name: string;
          description: string | null;
          is_personal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          name: string;
          description?: string | null;
          is_personal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          is_personal?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      list_memberships: {
        Row: {
          id: string;
          list_id: string;
          user_id: string;
          role: "owner" | "member";
          status: "accepted";
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          user_id: string;
          role?: "owner" | "member";
          status?: "accepted";
          created_at?: string;
        };
        Update: {
          role?: "owner" | "member";
          status?: "accepted";
        };
        Relationships: [];
      };
      list_invitations: {
        Row: {
          id: string;
          list_id: string;
          email: string;
          invited_by: string;
          status: "pending" | "accepted";
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          email: string;
          invited_by: string;
          status?: "pending" | "accepted";
          created_at?: string;
        };
        Update: {
          status?: "pending" | "accepted";
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
