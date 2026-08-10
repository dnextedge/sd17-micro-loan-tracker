export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          new_data: Json | null;
          old_data: Json | null;
          request_id: string | null;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          request_id?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          request_id?: string | null;
        };
        Relationships: [];
      };
      loan_applications: {
        Row: {
          admin_notes: string | null;
          application_number: string;
          approved_at: string | null;
          borrower_id: string;
          borrower_notes: string | null;
          created_at: string;
          id: string;
          preferred_start_date: string | null;
          purpose: string;
          rejected_at: string | null;
          repayment_duration_months: number;
          requested_amount: number;
          reviewed_at: string | null;
          status: Database["public"]["Enums"]["application_status"];
          submitted_at: string | null;
          updated_at: string;
        };
        Insert: {
          admin_notes?: string | null;
          application_number?: string;
          approved_at?: string | null;
          borrower_id: string;
          borrower_notes?: string | null;
          created_at?: string;
          id?: string;
          preferred_start_date?: string | null;
          purpose: string;
          rejected_at?: string | null;
          repayment_duration_months: number;
          requested_amount: number;
          reviewed_at?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          submitted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          admin_notes?: string | null;
          application_number?: string;
          approved_at?: string | null;
          borrower_id?: string;
          borrower_notes?: string | null;
          created_at?: string;
          id?: string;
          preferred_start_date?: string | null;
          purpose?: string;
          rejected_at?: string | null;
          repayment_duration_months?: number;
          requested_amount?: number;
          reviewed_at?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          submitted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loan_applications_borrower_id_fkey";
            columns: ["borrower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      loan_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          entity_id: string;
          entity_type: Database["public"]["Enums"]["history_entity_type"];
          id: string;
          new_status: string;
          notes: string | null;
          previous_status: string | null;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          entity_id: string;
          entity_type: Database["public"]["Enums"]["history_entity_type"];
          id?: string;
          new_status: string;
          notes?: string | null;
          previous_status?: string | null;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          entity_id?: string;
          entity_type?: Database["public"]["Enums"]["history_entity_type"];
          id?: string;
          new_status?: string;
          notes?: string | null;
          previous_status?: string | null;
        };
        Relationships: [];
      };
      loans: {
        Row: {
          amount_repaid: number;
          borrower_id: string;
          created_at: string;
          disbursed_at: string | null;
          id: string;
          installment_amount: number;
          interest_amount: number;
          interest_rate: number;
          loan_application_id: string;
          loan_number: string;
          maturity_date: string | null;
          outstanding_balance: number;
          principal_amount: number;
          repayment_duration_months: number;
          repayment_frequency: Database["public"]["Enums"]["repayment_frequency"];
          start_date: string | null;
          status: Database["public"]["Enums"]["loan_status"];
          total_repayable: number;
          updated_at: string;
        };
        Insert: {
          amount_repaid?: number;
          borrower_id: string;
          created_at?: string;
          disbursed_at?: string | null;
          id?: string;
          installment_amount: number;
          interest_amount?: number;
          interest_rate?: number;
          loan_application_id: string;
          loan_number?: string;
          maturity_date?: string | null;
          outstanding_balance: number;
          principal_amount: number;
          repayment_duration_months: number;
          repayment_frequency?: Database["public"]["Enums"]["repayment_frequency"];
          start_date?: string | null;
          status?: Database["public"]["Enums"]["loan_status"];
          total_repayable: number;
          updated_at?: string;
        };
        Update: {
          amount_repaid?: number;
          borrower_id?: string;
          created_at?: string;
          disbursed_at?: string | null;
          id?: string;
          installment_amount?: number;
          interest_amount?: number;
          interest_rate?: number;
          loan_application_id?: string;
          loan_number?: string;
          maturity_date?: string | null;
          outstanding_balance?: number;
          principal_amount?: number;
          repayment_duration_months?: number;
          repayment_frequency?: Database["public"]["Enums"]["repayment_frequency"];
          start_date?: string | null;
          status?: Database["public"]["Enums"]["loan_status"];
          total_repayable?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loan_application_borrower_fk";
            columns: ["loan_application_id", "borrower_id"];
            isOneToOne: false;
            referencedRelation: "loan_applications";
            referencedColumns: ["id", "borrower_id"];
          },
          {
            foreignKeyName: "loans_borrower_id_fkey";
            columns: ["borrower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_loan_application_id_fkey";
            columns: ["loan_application_id"];
            isOneToOne: true;
            referencedRelation: "loan_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          message: string;
          notification_type: string;
          read_at: string | null;
          recipient_user_id: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          message: string;
          notification_type?: string;
          read_at?: string | null;
          recipient_user_id: string;
          title: string;
        };
        Update: {
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          message?: string;
          notification_type?: string;
          read_at?: string | null;
          recipient_user_id?: string;
          title?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          address: string | null;
          business_type: string | null;
          created_at: string;
          email: string | null;
          employment_type: string | null;
          full_name: string | null;
          id: string;
          occupation: string | null;
          phone: string | null;
          profile_completed_at: string | null;
          state: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          business_type?: string | null;
          created_at?: string;
          email?: string | null;
          employment_type?: string | null;
          full_name?: string | null;
          id?: string;
          occupation?: string | null;
          phone?: string | null;
          profile_completed_at?: string | null;
          state?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: string | null;
          business_type?: string | null;
          created_at?: string;
          email?: string | null;
          employment_type?: string | null;
          full_name?: string | null;
          id?: string;
          occupation?: string | null;
          phone?: string | null;
          profile_completed_at?: string | null;
          state?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      repayment_schedules: {
        Row: {
          amount_due: number;
          amount_paid: number;
          created_at: string;
          due_date: string;
          id: string;
          installment_number: number;
          loan_id: string;
          outstanding_amount: number;
          paid_at: string | null;
          status: Database["public"]["Enums"]["repayment_status"];
          updated_at: string;
        };
        Insert: {
          amount_due: number;
          amount_paid?: number;
          created_at?: string;
          due_date: string;
          id?: string;
          installment_number: number;
          loan_id: string;
          outstanding_amount: number;
          paid_at?: string | null;
          status?: Database["public"]["Enums"]["repayment_status"];
          updated_at?: string;
        };
        Update: {
          amount_due?: number;
          amount_paid?: number;
          created_at?: string;
          due_date?: string;
          id?: string;
          installment_number?: number;
          loan_id?: string;
          outstanding_amount?: number;
          paid_at?: string | null;
          status?: Database["public"]["Enums"]["repayment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "repayment_schedules_loan_id_fkey";
            columns: ["loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
        ];
      };
      repayments: {
        Row: {
          amount: number;
          borrower_id: string;
          created_at: string;
          id: string;
          loan_id: string;
          notes: string | null;
          payment_date: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_reference: string;
          recorded_by: string;
          repayment_schedule_id: string | null;
        };
        Insert: {
          amount: number;
          borrower_id: string;
          created_at?: string;
          id?: string;
          loan_id: string;
          notes?: string | null;
          payment_date?: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_reference: string;
          recorded_by: string;
          repayment_schedule_id?: string | null;
        };
        Update: {
          amount?: number;
          borrower_id?: string;
          created_at?: string;
          id?: string;
          loan_id?: string;
          notes?: string | null;
          payment_date?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          payment_reference?: string;
          recorded_by?: string;
          repayment_schedule_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "repayment_loan_borrower_fk";
            columns: ["loan_id", "borrower_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id", "borrower_id"];
          },
          {
            foreignKeyName: "repayment_schedule_loan_fk";
            columns: ["repayment_schedule_id", "loan_id"];
            isOneToOne: false;
            referencedRelation: "repayment_schedule_effective";
            referencedColumns: ["id", "loan_id"];
          },
          {
            foreignKeyName: "repayment_schedule_loan_fk";
            columns: ["repayment_schedule_id", "loan_id"];
            isOneToOne: false;
            referencedRelation: "repayment_schedules";
            referencedColumns: ["id", "loan_id"];
          },
        ];
      };
      user_roles: {
        Row: {
          assigned_by: string | null;
          created_at: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          assigned_by?: string | null;
          created_at?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          assigned_by?: string | null;
          created_at?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      repayment_schedule_effective: {
        Row: {
          amount_due: number | null;
          amount_paid: number | null;
          created_at: string | null;
          due_date: string | null;
          effective_status:
            Database["public"]["Enums"]["repayment_status"] | null;
          id: string | null;
          installment_number: number | null;
          loan_id: string | null;
          outstanding_amount: number | null;
          paid_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          amount_due?: number | null;
          amount_paid?: number | null;
          created_at?: string | null;
          due_date?: string | null;
          effective_status?: never;
          id?: string | null;
          installment_number?: number | null;
          loan_id?: string | null;
          outstanding_amount?: number | null;
          paid_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          amount_due?: number | null;
          amount_paid?: number | null;
          created_at?: string | null;
          due_date?: string | null;
          effective_status?: never;
          id?: string | null;
          installment_number?: number | null;
          loan_id?: string | null;
          outstanding_amount?: number | null;
          paid_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "repayment_schedules_loan_id_fkey";
            columns: ["loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "borrower" | "admin";
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "cancelled";
      history_entity_type: "loan_application" | "loan";
      loan_status:
        | "approved"
        | "disbursed"
        | "active"
        | "overdue"
        | "fully_repaid"
        | "completed"
        | "defaulted"
        | "cancelled";
      payment_method: "cash" | "bank_transfer" | "other";
      repayment_frequency: "monthly";
      repayment_status: "pending" | "partially_paid" | "paid" | "overdue";
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
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
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
      app_role: ["borrower", "admin"],
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "cancelled",
      ],
      history_entity_type: ["loan_application", "loan"],
      loan_status: [
        "approved",
        "disbursed",
        "active",
        "overdue",
        "fully_repaid",
        "completed",
        "defaulted",
        "cancelled",
      ],
      payment_method: ["cash", "bank_transfer", "other"],
      repayment_frequency: ["monthly"],
      repayment_status: ["pending", "partially_paid", "paid", "overdue"],
    },
  },
} as const;
