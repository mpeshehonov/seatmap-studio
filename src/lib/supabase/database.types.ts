export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      event_seat_categories: {
        Row: {
          category: string;
          created_at: string;
          event_id: string;
          hall_id: string;
          id: string;
          owner_id: string;
          seat_id: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          event_id: string;
          hall_id: string;
          id?: string;
          owner_id: string;
          seat_id: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          event_id?: string;
          hall_id?: string;
          id?: string;
          owner_id?: string;
          seat_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_seat_categories_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_seat_categories_hall_id_fkey";
            columns: ["hall_id"];
            isOneToOne: false;
            referencedRelation: "halls";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          created_at: string;
          hall_id: string | null;
          id: string;
          owner_id: string;
          starts_at: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          hall_id?: string | null;
          id?: string;
          owner_id: string;
          starts_at?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          hall_id?: string | null;
          id?: string;
          owner_id?: string;
          starts_at?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_hall_id_fkey";
            columns: ["hall_id"];
            isOneToOne: false;
            referencedRelation: "halls";
            referencedColumns: ["id"];
          },
        ];
      };
      halls: {
        Row: {
          created_at: string;
          id: string;
          is_published: boolean;
          name: string;
          owner_id: string;
          updated_at: string;
          venue_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_published?: boolean;
          name: string;
          owner_id: string;
          updated_at?: string;
          venue_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_published?: boolean;
          name?: string;
          owner_id?: string;
          updated_at?: string;
          venue_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "halls_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      seat_maps: {
        Row: {
          created_at: string;
          hall_id: string;
          id: string;
          map_json: Json;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          hall_id: string;
          id?: string;
          map_json: Json;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          hall_id?: string;
          id?: string;
          map_json?: Json;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seat_maps_hall_id_fkey";
            columns: ["hall_id"];
            isOneToOne: true;
            referencedRelation: "halls";
            referencedColumns: ["id"];
          },
        ];
      };
      seat_statuses: {
        Row: {
          event_id: string | null;
          hall_id: string;
          id: string;
          owner_id: string;
          seat_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          event_id?: string | null;
          hall_id: string;
          id?: string;
          owner_id: string;
          seat_id: string;
          status: string;
          updated_at?: string;
        };
        Update: {
          event_id?: string | null;
          hall_id?: string;
          id?: string;
          owner_id?: string;
          seat_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seat_statuses_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seat_statuses_hall_id_fkey";
            columns: ["hall_id"];
            isOneToOne: false;
            referencedRelation: "halls";
            referencedColumns: ["id"];
          },
        ];
      };
      venues: {
        Row: {
          address: string | null;
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string;
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
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
    : never = never,
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
    : never = never,
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
