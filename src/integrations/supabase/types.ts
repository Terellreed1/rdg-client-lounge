export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          active: boolean
          created_at: string
          id: string
          logo_url: string | null
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          id: string
          used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent?: number
          id?: string
          used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          id?: string
          used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          active: boolean
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_city: string
          delivery_fee: number
          delivery_method: string
          delivery_state: string
          delivery_zip: string
          id: string
          items: Json
          notes: string | null
          pickup_location: string | null
          status: string
          stripe_session_id: string | null
          subtotal: number
          time_slot: string | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_city?: string
          delivery_fee?: number
          delivery_method?: string
          delivery_state?: string
          delivery_zip?: string
          id?: string
          items?: Json
          notes?: string | null
          pickup_location?: string | null
          status?: string
          stripe_session_id?: string | null
          subtotal?: number
          time_slot?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_city?: string
          delivery_fee?: number
          delivery_method?: string
          delivery_state?: string
          delivery_zip?: string
          id?: string
          items?: Json
          notes?: string | null
          pickup_location?: string | null
          status?: string
          stripe_session_id?: string | null
          subtotal?: number
          time_slot?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          brand: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_new: boolean
          name: string
          on_sale: boolean
          price: string
          product_type: string
          qty: number
          sold_out: boolean
          sort_order: number
          strain: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          brand: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_new?: boolean
          name: string
          on_sale?: boolean
          price: string
          product_type?: string
          qty?: number
          sold_out?: boolean
          sort_order?: number
          strain?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          brand?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_new?: boolean
          name?: string
          on_sale?: boolean
          price?: string
          product_type?: string
          qty?: number
          sold_out?: boolean
          sort_order?: number
          strain?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birthday: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          creator_email: string | null
          creator_name: string | null
          id: string
          total_signups: number
        }
        Insert: {
          code: string
          created_at?: string
          creator_email?: string | null
          creator_name?: string | null
          id?: string
          total_signups?: number
        }
        Update: {
          code?: string
          created_at?: string
          creator_email?: string | null
          creator_name?: string | null
          id?: string
          total_signups?: number
        }
        Relationships: []
      }
      referral_signups: {
        Row: {
          created_at: string
          id: string
          referral_code_id: string
          referred_email: string
          referred_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code_id: string
          referred_email: string
          referred_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_email?: string
          referred_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_signups_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          active: boolean
          author_name: string
          body: string
          created_at: string
          id: string
          product_id: string | null
          rating: number
          show_on_homepage: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          author_name: string
          body: string
          created_at?: string
          id?: string
          product_id?: string | null
          rating?: number
          show_on_homepage?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          product_id?: string | null
          rating?: number
          show_on_homepage?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      state_laws: {
        Row: {
          active: boolean
          can_deliver: boolean
          can_ship: boolean
          created_at: string
          id: string
          legal_status: string
          notes: string | null
          sort_order: number
          state_code: string
          state_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          can_deliver?: boolean
          can_ship?: boolean
          created_at?: string
          id?: string
          legal_status?: string
          notes?: string | null
          sort_order?: number
          state_code: string
          state_name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          can_deliver?: boolean
          can_ship?: boolean
          created_at?: string
          id?: string
          legal_status?: string
          notes?: string | null
          sort_order?: number
          state_code?: string
          state_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      wholesale_inquiries: {
        Row: {
          company_address: string
          company_name: string
          created_at: string
          email: string
          id: string
          license_number: string
          name: string
          phone: string
          sellers_permit_url: string | null
          state_license_url: string | null
          w9_url: string | null
          website: string | null
        }
        Insert: {
          company_address: string
          company_name: string
          created_at?: string
          email: string
          id?: string
          license_number: string
          name: string
          phone: string
          sellers_permit_url?: string | null
          state_license_url?: string | null
          w9_url?: string | null
          website?: string | null
        }
        Update: {
          company_address?: string
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          license_number?: string
          name?: string
          phone?: string
          sellers_permit_url?: string | null
          state_license_url?: string | null
          w9_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_referral_count: {
        Args: { code_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
