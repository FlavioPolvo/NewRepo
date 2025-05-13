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
      colors: {
        Row: {
          code: number;
          hex_color: string | null;
          id: number;
          name: string | null;
        };
        Insert: {
          code: number;
          hex_color?: string | null;
          id?: number;
          name?: string | null;
        };
        Update: {
          code?: number;
          hex_color?: string | null;
          id?: number;
          name?: string | null;
        };
        Relationships: [];
      };
      communities: {
        Row: {
          id: number;
          municipality_id: number | null;
          name: string;
        };
        Insert: {
          id?: number;
          municipality_id?: number | null;
          name: string;
        };
        Update: {
          id?: number;
          municipality_id?: number | null;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "communities_municipality_id_fkey";
            columns: ["municipality_id"];
            isOneToOne: false;
            referencedRelation: "municipalities";
            referencedColumns: ["id"];
          },
        ];
      };
      communities_2: {
        Row: {
          id: number;
          municipality_id: number | null;
          name: string;
        };
        Insert: {
          id?: number;
          municipality_id?: number | null;
          name: string;
        };
        Update: {
          id?: number;
          municipality_id?: number | null;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "communities_2_municipality_id_fkey"; // Assuming a similar FK name
            columns: ["municipality_id"];
            isOneToOne: false;
            referencedRelation: "municipalities";
            referencedColumns: ["id"];
          },
        ];
      };
      entries: {
        Row: {
          anal: string | null;
          apiary: string | null;
          ce: string | null;
          color_code: string | null;
          contract: string | null;
          created_at: string | null;
          date: string;
          gross_weight: number;
          humidity: number | null;
          id: number;
          lot: string | null;
          net_weight: number;
          prod: string | null;
          producer_id: number | null;
          quantity: number;
          tare: number;
          total_tare: number;
          total_value: number;
          unit_value: number;
          updated_at: string | null;
        };
        Insert: {
          anal?: string | null;
          apiary?: string | null;
          ce?: string | null;
          color_code?: string | null;
          contract?: string | null;
          created_at?: string | null;
          date: string;
          gross_weight: number;
          humidity?: number | null;
          id?: number;
          lot?: string | null;
          net_weight: number;
          prod?: string | null;
          producer_id?: number | null;
          quantity: number;
          tare: number;
          total_tare: number;
          total_value: number;
          unit_value: number;
          updated_at?: string | null;
        };
        Update: {
          anal?: string | null;
          apiary?: string | null;
          ce?: string | null;
          color_code?: string | null;
          contract?: string | null;
          created_at?: string | null;
          date?: string;
          gross_weight?: number;
          humidity?: number | null;
          id?: number;
          lot?: string | null;
          net_weight?: number;
          prod?: string | null;
          producer_id?: number | null;
          quantity?: number;
          tare?: number;
          total_tare?: number;
          total_value?: number;
          unit_value?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "entries_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      municipalities: {
        Row: {
          id: number;
          name: string;
          region: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          region?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          region?: string | null;
        };
        Relationships: [];
      };
      producers: {
        Row: {
          address: string | null;
          affiliation_date: string | null;
          birth_date: string | null;
          certification_code: string | null;
          cod_na_comapi: string;
          community: string | null;
          cooperative: string | null;
          cpf: string | null;
          created_at: string | null;
          dap_expiration: string | null;
          dap_number: string | null;
          education_level: string | null;
          fair_trade: boolean | null;
          gender: string | null;
          hive_quantity: number | null;
          honey_production: boolean | null;
          id: number;
          marital_status: string | null;
          municipality: string | null;
          name: string;
          nickname: string | null;
          organic: boolean | null;
          property_size: string | null;
          rg: string | null;
          status: string | null;
          uf: string | null;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          affiliation_date?: string | null;
          birth_date?: string | null;
          certification_code?: string | null;
          cod_na_comapi: string;
          community?: string | null;
          cooperative?: string | null;
          cpf?: string | null;
          created_at?: string | null;
          dap_expiration?: string | null;
          dap_number?: string | null;
          education_level?: string | null;
          fair_trade?: boolean | null;
          gender?: string | null;
          hive_quantity?: number | null;
          honey_production?: boolean | null;
          id?: number;
          marital_status?: string | null;
          municipality?: string | null;
          name: string;
          nickname?: string | null;
          organic?: boolean | null;
          property_size?: string | null;
          rg?: string | null;
          status?: string | null;
          uf?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          affiliation_date?: string | null;
          birth_date?: string | null;
          certification_code?: string | null;
          cod_na_comapi?: string;
          community?: string | null;
          cooperative?: string | null;
          cpf?: string | null;
          created_at?: string | null;
          dap_expiration?: string | null;
          dap_number?: string | null;
          education_level?: string | null;
          fair_trade?: boolean | null;
          gender?: string | null;
          hive_quantity?: number | null;
          honey_production?: boolean | null;
          id?: number;
          marital_status?: string | null;
          municipality?: string | null;
          name?: string;
          nickname?: string | null;
          organic?: boolean | null;
          property_size?: string | null;
          rg?: string | null;
          status?: string | null;
          uf?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
