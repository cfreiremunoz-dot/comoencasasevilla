export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      admin_email_allowlist: {
        Row: {
          created_at: string;
          email: string;
        };
        Insert: {
          created_at?: string;
          email: string;
        };
        Update: {
          created_at?: string;
          email?: string;
        };
        Relationships: [];
      };
      news_articles: {
        Row: {
          author_name: string;
          body: string;
          created_at: string;
          genre: string;
          id: string;
          image_caption: string;
          image_path: string | null;
          neighborhood: string;
          published: boolean;
          published_at: string | null;
          sources: string;
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_name: string;
          body: string;
          created_at?: string;
          genre?: string;
          id?: string;
          image_caption?: string;
          image_path?: string | null;
          neighborhood: string;
          published?: boolean;
          published_at?: string | null;
          sources?: string;
          summary?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_name?: string;
          body?: string;
          created_at?: string;
          genre?: string;
          id?: string;
          image_caption?: string;
          image_path?: string | null;
          neighborhood?: string;
          published?: boolean;
          published_at?: string | null;
          sources?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recommendations: {
        Row: {
          address: string | null;
          author_name: string | null;
          category: string;
          created_at: string;
          description: string;
          id: string;
          image_url: string | null;
          instagram: string | null;
          name: string;
          phone: string | null;
          post_type: string;
          rating: number;
          status: string;
          website: string | null;
          zone: string;
        };
        Insert: {
          address?: string | null;
          author_name?: string | null;
          category?: string;
          created_at?: string;
          description: string;
          id?: string;
          image_url?: string | null;
          instagram?: string | null;
          name: string;
          phone?: string | null;
          post_type?: string;
          rating?: number;
          status?: string;
          website?: string | null;
          zone?: string;
        };
        Update: {
          address?: string | null;
          author_name?: string | null;
          category?: string;
          created_at?: string;
          description?: string;
          id?: string;
          image_url?: string | null;
          instagram?: string | null;
          name?: string;
          phone?: string | null;
          post_type?: string;
          rating?: number;
          status?: string;
          website?: string | null;
          zone?: string;
        };
        Relationships: [];
      };
      guide_profiles: {
        Row: {
          bio: string;
          created_at: string;
          display_name: string;
          id: string;
          stripe_account_id: string | null;
          stripe_charges_enabled: boolean;
          stripe_details_submitted: boolean;
          stripe_payouts_enabled: boolean;
          updated_at: string;
          user_id: string;
          verification_notes: string | null;
          verification_status: string;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          bio: string;
          created_at?: string;
          display_name: string;
          id?: string;
          stripe_account_id?: string | null;
          stripe_charges_enabled?: boolean;
          stripe_details_submitted?: boolean;
          stripe_payouts_enabled?: boolean;
          updated_at?: string;
          user_id: string;
          verification_notes?: string | null;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          bio?: string;
          created_at?: string;
          display_name?: string;
          id?: string;
          stripe_account_id?: string | null;
          stripe_charges_enabled?: boolean;
          stripe_details_submitted?: boolean;
          stripe_payouts_enabled?: boolean;
          updated_at?: string;
          user_id?: string;
          verification_notes?: string | null;
          verification_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [];
      };
      guide_verification_events: {
        Row: {
          actor_user_id: string;
          created_at: string;
          guide_id: string;
          id: string;
          notes: string | null;
          status: string;
        };
        Insert: {
          actor_user_id: string;
          created_at?: string;
          guide_id: string;
          id?: string;
          notes?: string | null;
          status: string;
        };
        Update: {
          actor_user_id?: string;
          created_at?: string;
          guide_id?: string;
          id?: string;
          notes?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      guided_visits: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          duration_minutes: number;
          guide_id: string;
          id: string;
          image_url: string | null;
          meeting_point: string;
          neighborhood: string;
          price_per_person_cents: number;
          slug: string;
          status: string;
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description: string;
          duration_minutes: number;
          guide_id: string;
          id?: string;
          image_url?: string | null;
          meeting_point: string;
          neighborhood: string;
          price_per_person_cents: number;
          slug: string;
          status?: string;
          summary: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          duration_minutes?: number;
          guide_id?: string;
          id?: string;
          image_url?: string | null;
          meeting_point?: string;
          neighborhood?: string;
          price_per_person_cents?: number;
          slug?: string;
          status?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guided_visits_guide_id_fkey";
            columns: ["guide_id"];
            isOneToOne: true;
            referencedRelation: "guide_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      site_experiences: {
        Row: {
          data: Json;
          hidden: boolean;
          slug: string;
          updated_at: string;
        };
        Insert: {
          data: Json;
          hidden?: boolean;
          slug: string;
          updated_at?: string;
        };
        Update: {
          data?: Json;
          hidden?: boolean;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_pages: {
        Row: {
          content: Json;
          slug: string;
          updated_at: string;
        };
        Insert: {
          content: Json;
          slug: string;
          updated_at?: string;
        };
        Update: {
          content?: Json;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_routes: {
        Row: {
          data: Json;
          hidden: boolean;
          slug: string;
          updated_at: string;
        };
        Insert: {
          data: Json;
          hidden?: boolean;
          slug: string;
          updated_at?: string;
        };
        Update: {
          data?: Json;
          hidden?: boolean;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_texts: {
        Row: {
          key: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value: string;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
      stripe_connected_accounts: {
        Row: {
          details_submitted: boolean;
          guide_id: string;
          stripe_account_id: string;
          transfers_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          details_submitted?: boolean;
          guide_id: string;
          stripe_account_id: string;
          transfers_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          details_submitted?: boolean;
          guide_id?: string;
          stripe_account_id?: string;
          transfers_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stripe_connected_accounts_guide_id_fkey";
            columns: ["guide_id"];
            isOneToOne: true;
            referencedRelation: "guide_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      stripe_webhook_events: {
        Row: {
          event_id: string;
          event_type: string;
          processed_at: string;
        };
        Insert: {
          event_id: string;
          event_type: string;
          processed_at?: string;
        };
        Update: {
          event_id?: string;
          event_type?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
      visit_bookings: {
        Row: {
          checkout_idempotency_key: string | null;
          created_at: string;
          guest_count: number;
          hold_expires_at: string;
          id: string;
          platform_fee_cents: number;
          slot_id: string;
          status: string;
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          total_amount_cents: number;
        };
        Insert: {
          checkout_idempotency_key?: string | null;
          created_at?: string;
          guest_count: number;
          hold_expires_at: string;
          id?: string;
          platform_fee_cents: number;
          slot_id: string;
          status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          total_amount_cents: number;
        };
        Update: {
          checkout_idempotency_key?: string | null;
          created_at?: string;
          guest_count?: number;
          hold_expires_at?: string;
          id?: string;
          platform_fee_cents?: number;
          slot_id?: string;
          status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          total_amount_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: "visit_bookings_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: false;
            referencedRelation: "visit_slots";
            referencedColumns: ["id"];
          },
        ];
      };
      visit_slots: {
        Row: {
          active: boolean;
          capacity: number;
          created_at: string;
          id: string;
          starts_at: string;
          visit_id: string;
        };
        Insert: {
          active?: boolean;
          capacity: number;
          created_at?: string;
          id?: string;
          starts_at: string;
          visit_id: string;
        };
        Update: {
          active?: boolean;
          capacity?: number;
          created_at?: string;
          id?: string;
          starts_at?: string;
          visit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visit_slots_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "guided_visits";
            referencedColumns: ["id"];
          },
        ];
      };
      support_handoffs: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          name: string;
          question: string;
          status: string;
          transcript: Json;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          name?: string;
          question?: string;
          status?: string;
          transcript?: Json;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          question?: string;
          status?: string;
          transcript?: Json;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_visit_booking_hold:
        | {
            Args: { p_guest_count: number; p_slot_id: string };
            Returns: {
              booking_id: string;
              hold_expires_at: string;
              platform_fee_cents: number;
              total_amount_cents: number;
            }[];
          }
        | {
            Args: {
              p_guest_count: number;
              p_idempotency_key: string;
              p_slot_id: string;
            };
            Returns: {
              booking_id: string;
              hold_expires_at: string;
              platform_fee_cents: number;
              total_amount_cents: number;
            }[];
          };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const;
