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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          metadata: Json
          name: string
          notes: string | null
          phone: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json
          name: string
          notes?: string | null
          phone: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json
          name?: string
          notes?: string | null
          phone?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string
          id: string
          image_path: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_path: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_path?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      option_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          key: string
          metadata: Json
          name: string
          select_type: Database["public"]["Enums"]["option_select_type"]
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          key: string
          metadata?: Json
          name: string
          select_type?: Database["public"]["Enums"]["option_select_type"]
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          key?: string
          metadata?: Json
          name?: string
          select_type?: Database["public"]["Enums"]["option_select_type"]
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      option_rules: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          option_id: string
          rule_type: Database["public"]["Enums"]["option_rule_type"]
          target_label: string | null
          target_option_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          option_id: string
          rule_type: Database["public"]["Enums"]["option_rule_type"]
          target_label?: string | null
          target_option_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          option_id?: string
          rule_type?: Database["public"]["Enums"]["option_rule_type"]
          target_label?: string | null
          target_option_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "option_rules_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "option_rules_target_option_id_fkey"
            columns: ["target_option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string
          description: string | null
          group_id: string
          id: string
          is_active: boolean
          key: string
          metadata: Json
          name: string
          price_adjustment_cents: number
          sort_order: number
          svg_token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          is_active?: boolean
          key: string
          metadata?: Json
          name: string
          price_adjustment_cents?: number
          sort_order?: number
          svg_token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          is_active?: boolean
          key?: string
          metadata?: Json
          name?: string
          price_adjustment_cents?: number
          sort_order?: number
          svg_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "option_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_options: {
        Row: {
          created_at: string
          group_key: string
          group_label: string
          id: string
          option_id: string | null
          order_item_id: string
          position: number
          price_cents: number | null
          tier_index: number | null
          value_key: string | null
          value_label: string
        }
        Insert: {
          created_at?: string
          group_key: string
          group_label: string
          id?: string
          option_id?: string | null
          order_item_id: string
          position?: number
          price_cents?: number | null
          tier_index?: number | null
          value_key?: string | null
          value_label: string
        }
        Update: {
          created_at?: string
          group_key?: string
          group_label?: string
          id?: string
          option_id?: string | null
          order_item_id?: string
          position?: number
          price_cents?: number | null
          tier_index?: number | null
          value_key?: string | null
          value_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_item_options_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json
          name: string
          order_id: string
          position: number
          product_id: string | null
          quantity: number
          size_id: string | null
          size_label: string | null
          unit_price_cents: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          order_id: string
          position?: number
          product_id?: string | null
          quantity?: number
          size_id?: string | null
          size_label?: string | null
          unit_price_cents?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          order_id?: string
          position?: number
          product_id?: string | null
          quantity?: number
          size_id?: string | null
          size_label?: string | null
          unit_price_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          note: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          channel: Database["public"]["Enums"]["order_channel"]
          created_at: string
          currency: string
          customer_id: string
          customer_notes: string | null
          event_date: string | null
          id: string
          inspiration_url: string | null
          internal_notes: string | null
          metadata: Json
          occasion: string | null
          order_number: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number | null
          summary: string | null
          total_cents: number | null
          updated_at: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["order_channel"]
          created_at?: string
          currency?: string
          customer_id: string
          customer_notes?: string | null
          event_date?: string | null
          id?: string
          inspiration_url?: string | null
          internal_notes?: string | null
          metadata?: Json
          occasion?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number | null
          summary?: string | null
          total_cents?: number | null
          updated_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["order_channel"]
          created_at?: string
          currency?: string
          customer_id?: string
          customer_notes?: string | null
          event_date?: string | null
          id?: string
          inspiration_url?: string | null
          internal_notes?: string | null
          metadata?: Json
          occasion?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number | null
          summary?: string | null
          total_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_option_groups: {
        Row: {
          created_at: string
          id: string
          is_required: boolean | null
          option_group_id: string
          product_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          option_group_id: string
          product_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          option_group_id?: string
          product_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_groups_option_group_id_fkey"
            columns: ["option_group_id"]
            isOneToOne: false
            referencedRelation: "option_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_option_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price_cents: number | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["product_kind"]
          metadata: Json
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          base_price_cents?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["product_kind"]
          metadata?: Json
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          base_price_cents?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["product_kind"]
          metadata?: Json
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_order_number: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin"
      option_rule_type: "pairs_with" | "requires" | "excludes"
      option_select_type: "single" | "multi"
      order_channel: "website" | "whatsapp" | "phone" | "instagram" | "walk_in"
      order_status:
        | "enquiry"
        | "quoted"
        | "confirmed"
        | "in_production"
        | "ready"
        | "completed"
        | "cancelled"
      product_kind: "cake" | "baked_good" | "gift_card" | "service" | "delivery"
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
    Enums: {
      app_role: ["admin"],
      option_rule_type: ["pairs_with", "requires", "excludes"],
      option_select_type: ["single", "multi"],
      order_channel: ["website", "whatsapp", "phone", "instagram", "walk_in"],
      order_status: [
        "enquiry",
        "quoted",
        "confirmed",
        "in_production",
        "ready",
        "completed",
        "cancelled",
      ],
      product_kind: ["cake", "baked_good", "gift_card", "service", "delivery"],
    },
  },
} as const
