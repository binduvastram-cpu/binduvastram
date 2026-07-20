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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string | null
          created_at: string
          id: string
          is_default: boolean
          line1: string
          line2: string | null
          pincode: string
          profile_id: string
          state: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          line1: string
          line2?: string | null
          pincode: string
          profile_id: string
          state?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          line1?: string
          line2?: string | null
          pincode?: string
          profile_id?: string
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attributes: {
        Row: {
          id: string
          kind: string
          value: string
        }
        Insert: {
          id?: string
          kind: string
          value: string
        }
        Update: {
          id?: string
          kind?: string
          value?: string
        }
        Relationships: []
      }
      cancellation_requests: {
        Row: {
          created_at: string
          id: string
          order_id: string
          profile_id: string
          reason: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          profile_id: string
          reason?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          profile_id?: string
          reason?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellation_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          product_id: string
          profile_id: string
          quantity: number
          size: string
          updated_at: string
        }
        Insert: {
          product_id: string
          profile_id: string
          quantity?: number
          size?: string
          updated_at?: string
        }
        Update: {
          product_id?: string
          profile_id?: string
          quantity?: number
          size?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          filter_kinds: string[]
          id: string
          image_url: string | null
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          filter_kinds?: string[]
          id?: string
          image_url?: string | null
          label: string
          value: string
        }
        Update: {
          created_at?: string
          filter_kinds?: string[]
          id?: string
          image_url?: string | null
          label?: string
          value?: string
        }
        Relationships: []
      }
      collection_families: {
        Row: {
          created_at: string
          id: string
          label: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          slug?: string
        }
        Relationships: []
      }
      collection_groups: {
        Row: {
          family_id: string
          id: string
          label: string
          slug: string
        }
        Insert: {
          family_id: string
          id?: string
          label: string
          slug: string
        }
        Update: {
          family_id?: string
          id?: string
          label?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_groups_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "collection_families"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          family_id: string
          group_id: string | null
          id: string
          label: string
          slug: string
        }
        Insert: {
          family_id: string
          group_id?: string | null
          id?: string
          label: string
          slug: string
        }
        Update: {
          family_id?: string
          group_id?: string | null
          id?: string
          label?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "collection_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "collection_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          category_id: string | null
          code: string
          created_at: string
          discount_percent: number
          end_date: string
          id: string
          is_active: boolean
          product_id: string | null
          scope: string
          start_date: string | null
        }
        Insert: {
          category_id?: string | null
          code: string
          created_at?: string
          discount_percent: number
          end_date: string
          id?: string
          is_active?: boolean
          product_id?: string | null
          scope?: string
          start_date?: string | null
        }
        Update: {
          category_id?: string | null
          code?: string
          created_at?: string
          discount_percent?: number
          end_date?: string
          id?: string
          is_active?: boolean
          product_id?: string | null
          scope?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          coupon_code: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          redeemed: boolean
        }
        Insert: {
          coupon_code: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          redeemed?: boolean
        }
        Update: {
          coupon_code?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          redeemed?: boolean
        }
        Relationships: []
      }
      offers: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean
          product_id: string | null
          scope: string
          start_date: string | null
          title: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          product_id?: string | null
          scope: string
          start_date?: string | null
          title: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          product_id?: string | null
          scope?: string
          start_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          image_url: string | null
          order_id: string
          price_at_purchase: number
          product_id: string | null
          product_name: string
          quantity: number
          size: string | null
        }
        Insert: {
          id?: string
          image_url?: string | null
          order_id: string
          price_at_purchase: number
          product_id?: string | null
          product_name: string
          quantity: number
          size?: string | null
        }
        Update: {
          id?: string
          image_url?: string | null
          order_id?: string
          price_at_purchase?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_log: {
        Row: {
          changed_at: string
          id: string
          order_id: string
          status: string
        }
        Insert: {
          changed_at?: string
          id?: string
          order_id: string
          status: string
        }
        Update: {
          changed_at?: string
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          coupon_code: string | null
          created_at: string
          customer_address: string
          customer_name: string
          customer_phone: string
          customer_pincode: string
          discount_amount: number
          id: string
          order_code: string
          order_status: string
          payment_method: string
          payment_status: string
          profile_id: string | null
          subtotal: number
          total: number
        }
        Insert: {
          address_id?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_address: string
          customer_name: string
          customer_phone: string
          customer_pincode: string
          discount_amount?: number
          id?: string
          order_code?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          profile_id?: string | null
          subtotal: number
          total: number
        }
        Update: {
          address_id?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_phone?: string
          customer_pincode?: string
          discount_amount?: number
          id?: string
          order_code?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          profile_id?: string | null
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          id: string
          image_url: string
          product_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          image_url: string
          product_id: string
          sort_order?: number
        }
        Update: {
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
      product_sizes: {
        Row: {
          id: string
          product_id: string
          size: string
          stock: number
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          stock?: number
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bought_count: number | null
          category_id: string
          cod_available: boolean
          code: string | null
          collection_item_id: string | null
          created_at: string
          description: string
          estimated_delivery_max: number
          estimated_delivery_min: number
          id: string
          is_active: boolean
          mrp: number | null
          name: string
          price: number
          properties: Json
          stock: number
          tagline: string | null
          video_url: string | null
        }
        Insert: {
          bought_count?: number | null
          category_id: string
          cod_available?: boolean
          code?: string | null
          collection_item_id?: string | null
          created_at?: string
          description?: string
          estimated_delivery_max?: number
          estimated_delivery_min?: number
          id?: string
          is_active?: boolean
          mrp?: number | null
          name: string
          price?: number
          properties?: Json
          stock?: number
          tagline?: string | null
          video_url?: string | null
        }
        Update: {
          bought_count?: number | null
          category_id?: string
          cod_available?: boolean
          code?: string | null
          collection_item_id?: string | null
          created_at?: string
          description?: string
          estimated_delivery_max?: number
          estimated_delivery_min?: number
          id?: string
          is_active?: boolean
          mrp?: number | null
          name?: string
          price?: number
          properties?: Json
          stock?: number
          tagline?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_item_id_fkey"
            columns: ["collection_item_id"]
            isOneToOne: false
            referencedRelation: "collection_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_admin: boolean
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_admin?: boolean
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          customer_name: string
          id: string
          product_id: string
          profile_id: string | null
          rating: number
          reply: string | null
          status: string
          text: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          id?: string
          product_id: string
          profile_id?: string | null
          rating: number
          reply?: string | null
          status?: string
          text: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          id?: string
          product_id?: string
          profile_id?: string | null
          rating?: number
          reply?: string | null
          status?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_shopping_requests: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          preferred_date: string
          preferred_time: string
          product_id: string | null
          product_name: string | null
          status: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone: string
          preferred_date: string
          preferred_time: string
          product_id?: string | null
          product_name?: string | null
          status?: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          preferred_date?: string
          preferred_time?: string
          product_id?: string | null
          product_name?: string | null
          status?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "virtual_shopping_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          product_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      validate_coupon: {
        Args: { p_code: string }
        Returns: {
          category_value: string
          discount_percent: number
          message: string
          product_id: string
          scope: string
          valid: boolean
        }[]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
