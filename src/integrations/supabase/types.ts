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
      availability_blocks: {
        Row: {
          block_type: Database["public"]["Enums"]["availability_block_type"]
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          metadata: Json
          reason: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          block_type?: Database["public"]["Enums"]["availability_block_type"]
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          metadata?: Json
          reason?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          block_type?: Database["public"]["Enums"]["availability_block_type"]
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          metadata?: Json
          reason?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean
          created_at: string
          created_by: string | null
          end_at: string | null
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          id: string
          location: string | null
          metadata: Json
          notes: string | null
          order_id: string | null
          start_at: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          created_at?: string
          created_by?: string | null
          end_at?: string | null
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          id?: string
          location?: string | null
          metadata?: Json
          notes?: string | null
          order_id?: string | null
          start_at: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          created_at?: string
          created_by?: string | null
          end_at?: string | null
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          id?: string
          location?: string | null
          metadata?: Json
          notes?: string | null
          order_id?: string | null
          start_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      capacity_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          lead_time_days: number
          max_orders_per_day: number
          max_servings_per_day: number | null
          metadata: Json
          notes: string | null
          updated_at: string
          weekday: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          lead_time_days?: number
          max_orders_per_day?: number
          max_servings_per_day?: number | null
          metadata?: Json
          notes?: string | null
          updated_at?: string
          weekday?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          lead_time_days?: number
          max_orders_per_day?: number
          max_servings_per_day?: number | null
          metadata?: Json
          notes?: string | null
          updated_at?: string
          weekday?: number | null
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          city: string | null
          country: string
          created_at: string
          customer_id: string
          delivery_notes: string | null
          id: string
          is_default: boolean
          label: string
          line1: string
          line2: string | null
          metadata: Json
          phone: string | null
          postal_code: string | null
          province: string | null
          recipient_name: string | null
          suburb: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string
          created_at?: string
          customer_id: string
          delivery_notes?: string | null
          id?: string
          is_default?: boolean
          label?: string
          line1: string
          line2?: string | null
          metadata?: Json
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          recipient_name?: string | null
          suburb?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string
          created_at?: string
          customer_id?: string
          delivery_notes?: string | null
          id?: string
          is_default?: boolean
          label?: string
          line1?: string
          line2?: string | null
          metadata?: Json
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          recipient_name?: string | null
          suburb?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          marketing_opt_in: boolean
          metadata: Json
          name: string
          notes: string | null
          phone: string
          preferred_channel: Database["public"]["Enums"]["contact_channel"]
          profile_id: string | null
          status: Database["public"]["Enums"]["customer_status"]
          tags: string[]
          updated_at: string
          whatsapp_phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          marketing_opt_in?: boolean
          metadata?: Json
          name: string
          notes?: string | null
          phone: string
          preferred_channel?: Database["public"]["Enums"]["contact_channel"]
          profile_id?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          tags?: string[]
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          marketing_opt_in?: boolean
          metadata?: Json
          name?: string
          notes?: string | null
          phone?: string
          preferred_channel?: Database["public"]["Enums"]["contact_channel"]
          profile_id?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          tags?: string[]
          updated_at?: string
          whatsapp_phone?: string | null
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
      price_list_items: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          is_active: boolean
          label: string
          metadata: Json
          min_quantity: number
          notes: string | null
          option_id: string | null
          price_list_id: string
          product_id: string | null
          size_key: string | null
          sort_order: number
          target_type: Database["public"]["Enums"]["price_target_type"]
          tier_count: number | null
          unit: Database["public"]["Enums"]["price_unit"]
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          metadata?: Json
          min_quantity?: number
          notes?: string | null
          option_id?: string | null
          price_list_id: string
          product_id?: string | null
          size_key?: string | null
          sort_order?: number
          target_type: Database["public"]["Enums"]["price_target_type"]
          tier_count?: number | null
          unit?: Database["public"]["Enums"]["price_unit"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          metadata?: Json
          min_quantity?: number
          notes?: string | null
          option_id?: string | null
          price_list_id?: string
          product_id?: string | null
          size_key?: string | null
          sort_order?: number
          target_type?: Database["public"]["Enums"]["price_target_type"]
          tier_count?: number | null
          unit?: Database["public"]["Enums"]["price_unit"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_list_items_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_list_items_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      price_lists: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean
          is_default: boolean
          metadata: Json
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          metadata?: Json
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          metadata?: Json
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          adjustment_type: Database["public"]["Enums"]["pricing_adjustment_type"]
          adjustment_value: number
          conditions: Json
          created_at: string
          description: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          price_list_id: string | null
          priority: number
          rule_type: Database["public"]["Enums"]["pricing_rule_type"]
          updated_at: string
        }
        Insert: {
          adjustment_type?: Database["public"]["Enums"]["pricing_adjustment_type"]
          adjustment_value?: number
          conditions?: Json
          created_at?: string
          description?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          price_list_id?: string | null
          priority?: number
          rule_type: Database["public"]["Enums"]["pricing_rule_type"]
          updated_at?: string
        }
        Update: {
          adjustment_type?: Database["public"]["Enums"]["pricing_adjustment_type"]
          adjustment_value?: number
          conditions?: Json
          created_at?: string
          description?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          price_list_id?: string | null
          priority?: number
          rule_type?: Database["public"]["Enums"]["pricing_rule_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
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
      customer_summary: {
        Args: never
        Returns: {
          customer_id: string
          last_order_at: string
          next_event_date: string
          order_count: number
        }[]
      }
      day_availability: {
        Args: { _from: string; _to: string }
        Returns: {
          block_reason: string
          day: string
          is_available: boolean
          is_blocked: boolean
          lead_time_days: number
          max_orders: number
          order_count: number
        }[]
      }
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
      availability_block_type: "closure" | "holiday" | "fully_booked" | "custom"
      calendar_event_type:
        | "production"
        | "collection"
        | "delivery"
        | "consultation"
        | "other"
      contact_channel: "whatsapp" | "phone" | "email" | "instagram"
      customer_status: "lead" | "active" | "vip" | "inactive" | "blocked"
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
      price_target_type:
        | "product"
        | "option"
        | "tier"
        | "delivery"
        | "rush"
        | "service"
        | "custom"
      price_unit:
        | "flat"
        | "per_serving"
        | "per_tier"
        | "per_km"
        | "per_hour"
        | "percentage"
      pricing_adjustment_type: "fixed" | "percentage"
      pricing_rule_type:
        | "rush_order"
        | "delivery_zone"
        | "weekend_surcharge"
        | "holiday_surcharge"
        | "seasonal_promotion"
        | "minimum_order"
        | "custom"
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
      availability_block_type: ["closure", "holiday", "fully_booked", "custom"],
      calendar_event_type: [
        "production",
        "collection",
        "delivery",
        "consultation",
        "other",
      ],
      contact_channel: ["whatsapp", "phone", "email", "instagram"],
      customer_status: ["lead", "active", "vip", "inactive", "blocked"],
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
      price_target_type: [
        "product",
        "option",
        "tier",
        "delivery",
        "rush",
        "service",
        "custom",
      ],
      price_unit: [
        "flat",
        "per_serving",
        "per_tier",
        "per_km",
        "per_hour",
        "percentage",
      ],
      pricing_adjustment_type: ["fixed", "percentage"],
      pricing_rule_type: [
        "rush_order",
        "delivery_zone",
        "weekend_surcharge",
        "holiday_surcharge",
        "seasonal_promotion",
        "minimum_order",
        "custom",
      ],
      product_kind: ["cake", "baked_good", "gift_card", "service", "delivery"],
    },
  },
} as const
