export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          created_at: string | null;
          id: string;
          ip_address: unknown | null;
          new_values: Json | null;
          old_values: Json | null;
          record_id: string | null;
          table_name: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown | null;
          new_values?: Json | null;
          old_values?: Json | null;
          record_id?: string | null;
          table_name?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown | null;
          new_values?: Json | null;
          old_values?: Json | null;
          record_id?: string | null;
          table_name?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_account_summary";
            referencedColumns: ["id"];
          }
        ];
      };
      bank_accounts: {
        Row: {
          account_number: string;
          account_type: string | null;
          balance: number | null;
          created_at: string | null;
          currency: string | null;
          id: string;
          is_active: boolean | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          account_number: string;
          account_type?: string | null;
          balance?: number | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          is_active?: boolean | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          account_number?: string;
          account_type?: string | null;
          balance?: number | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          is_active?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bank_accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_account_summary";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: {
          amount: number;
          category: Database["public"]["Enums"]["transaction_category"] | null;
          created_at: string | null;
          currency: string | null;
          description: string | null;
          from_account_id: string | null;
          id: string;
          metadata: Json | null;
          processed_at: string | null;
          receipt_url: string | null;
          reference_number: string | null;
          sender_name: string | null;
          status: Database["public"]["Enums"]["transaction_status"] | null;
          to_account_id: string | null;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          category?: Database["public"]["Enums"]["transaction_category"] | null;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          from_account_id?: string | null;
          id?: string;
          metadata?: Json | null;
          processed_at?: string | null;
          receipt_url?: string | null;
          reference_number?: string | null;
          sender_name?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"] | null;
          to_account_id?: string | null;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          category?: Database["public"]["Enums"]["transaction_category"] | null;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          from_account_id?: string | null;
          id?: string;
          metadata?: Json | null;
          processed_at?: string | null;
          receipt_url?: string | null;
          reference_number?: string | null;
          sender_name?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"] | null;
          to_account_id?: string | null;
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_from_account_id_fkey";
            columns: ["from_account_id"];
            isOneToOne: false;
            referencedRelation: "bank_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey";
            columns: ["to_account_id"];
            isOneToOne: false;
            referencedRelation: "bank_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_account_summary";
            referencedColumns: ["id"];
          }
        ];
      };
      user_profiles: {
        Row: {
          account_status: string | null;
          address: Json | null;
          avatar_url: string | null;
          cpf: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string | null;
        };
        Insert: {
          account_status?: string | null;
          address?: Json | null;
          avatar_url?: string | null;
          cpf?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          account_status?: string | null;
          address?: Json | null;
          avatar_url?: string | null;
          cpf?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "user_account_summary";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      recent_transactions: {
        Row: {
          amount: number | null;
          created_at: string | null;
          currency: string | null;
          description: string | null;
          from_account_number: string | null;
          id: string | null;
          processed_at: string | null;
          reference_number: string | null;
          status: Database["public"]["Enums"]["transaction_status"] | null;
          to_account_number: string | null;
          transaction_type:
            | Database["public"]["Enums"]["transaction_type"]
            | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_account_summary";
            referencedColumns: ["id"];
          }
        ];
      };
      user_account_summary: {
        Row: {
          account_status: string | null;
          cpf: string | null;
          email: string | null;
          full_name: string | null;
          id: string | null;
          phone: string | null;
          profile_updated_at: string | null;
          total_accounts: number | null;
          total_balance: number | null;
          user_created_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      generate_account_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      generate_reference_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_account_balance: {
        Args: { account_uuid: string };
        Returns: number;
      };
      transfer_money: {
        Args: {
          from_account_uuid: string;
          to_account_uuid: string;
          transfer_amount: number;
          transfer_description?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      transaction_category:
        | "alimentacao"
        | "transporte"
        | "saude"
        | "educacao"
        | "entretenimento"
        | "compras"
        | "casa"
        | "trabalho"
        | "investimentos"
        | "viagem"
        | "outros";
      transaction_status: "pending" | "completed" | "failed" | "cancelled";
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "transfer"
        | "payment"
        | "fee";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
