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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["ai_message_role"]
          session_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["ai_message_role"]
          session_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["ai_message_role"]
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          metadata: Json | null
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          category: string
          created_at: string
          expires_at: string | null
          future_value_projection: Json | null
          id: string
          is_applied: boolean
          potential_savings_cents: number | null
          suggestion_text: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          expires_at?: string | null
          future_value_projection?: Json | null
          id?: string
          is_applied?: boolean
          potential_savings_cents?: number | null
          suggestion_text: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          expires_at?: string | null
          future_value_projection?: Json | null
          id?: string
          is_applied?: boolean
          potential_savings_cents?: number | null
          suggestion_text?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          occurred_at: string
          properties: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          occurred_at?: string
          properties?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          occurred_at?: string
          properties?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      budget_inputs: {
        Row: {
          created_at: string | null
          id: string
          input_method: string | null
          payload: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_method?: string | null
          payload: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          input_method?: string | null
          payload?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_inputs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          actual_cents: number
          budget_id: string
          category: string
          created_at: string | null
          id: string
          planned_cents: number
          updated_at: string | null
        }
        Insert: {
          actual_cents?: number
          budget_id: string
          category: string
          created_at?: string | null
          id?: string
          planned_cents: number
          updated_at?: string | null
        }
        Update: {
          actual_cents?: number
          budget_id?: string
          category?: string
          created_at?: string | null
          id?: string
          planned_cents?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_cents: number
          template_data: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_cents?: number
          template_data: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      budget_uploads: {
        Row: {
          file_data: Json
          filename: string
          id: string
          processed_at: string | null
          processed_budget_id: string | null
          status: string
          upload_date: string
          user_id: string
        }
        Insert: {
          file_data: Json
          filename: string
          id?: string
          processed_at?: string | null
          processed_budget_id?: string | null
          status?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          file_data?: Json
          filename?: string
          id?: string
          processed_at?: string | null
          processed_budget_id?: string | null
          status?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_uploads_processed_budget_id_fkey"
            columns: ["processed_budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_actions: {
        Row: {
          action_date: string
          action_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action_date?: string
          action_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action_date?: string
          action_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_transactions: {
        Row: {
          amount_cents: number
          created_at: string | null
          id: string
          note: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          id?: string
          note?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          note?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_wallets: {
        Row: {
          balance_cents: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance_cents?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance_cents?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      encouragements: {
        Row: {
          created_at: string | null
          emoji: string | null
          from_user_id: string | null
          group_id: string | null
          id: string
          note: string | null
          to_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          from_user_id?: string | null
          group_id?: string | null
          id?: string
          note?: string | null
          to_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          from_user_id?: string | null
          group_id?: string | null
          id?: string
          note?: string | null
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encouragements_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encouragements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encouragements_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_keys: {
        Row: {
          created_at: string | null
          encrypted_key: string
          id: string
          key_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          encrypted_key: string
          id?: string
          key_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          encrypted_key?: string
          id?: string
          key_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          end_at: string
          id: string
          location: string | null
          notes: string | null
          start_at: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          location?: string | null
          notes?: string | null
          start_at: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_group_invites: {
        Row: {
          created_at: string | null
          expires_at: string | null
          group_id: string | null
          id: string
          invitee_email: string
          role: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          invitee_email: string
          role: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          invitee_email?: string
          role?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_group_invites_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_group_members: {
        Row: {
          group_id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_groups: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_groups_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          progress: number
          status: Database["public"]["Enums"]["goal_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["goal_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["goal_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          code: string
          created_at: string
          end_at: string
          id: string
          max_members: number | null
          owner_id: string
          start_at: string
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          end_at: string
          id?: string
          max_members?: number | null
          owner_id: string
          start_at: string
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          end_at?: string
          id?: string
          max_members?: number | null
          owner_id?: string
          start_at?: string
          title?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          due_date: string | null
          id: string
          metadata: Json | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_ee841bb1: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          metadata: Json | null
          name: string | null
          source_page: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          source_page?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          source_page?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      linked_accounts: {
        Row: {
          access_token: string
          account_id: string
          account_name: string
          account_type: string
          balance_cents: number | null
          created_at: string
          encrypted_access_token: string | null
          id: string
          institution_name: string
          is_active: boolean
          last_sync: string | null
          token_iv: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_id: string
          account_name: string
          account_type: string
          balance_cents?: number | null
          created_at?: string
          encrypted_access_token?: string | null
          id?: string
          institution_name: string
          is_active?: boolean
          last_sync?: string | null
          token_iv?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string
          account_name?: string
          account_type?: string
          balance_cents?: number | null
          created_at?: string
          encrypted_access_token?: string | null
          id?: string
          institution_name?: string
          is_active?: boolean
          last_sync?: string | null
          token_iv?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          btc_price_usd: number | null
          btc_quantity: number | null
          btc_trade_id: string | null
          charge_status: string
          created_at: string
          id: string
          match_amount_cents: number
          match_rule_id: string
          original_amount_cents: number
          recipient_user_id: string
          save_event_id: string
          sponsor_id: string
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          btc_price_usd?: number | null
          btc_quantity?: number | null
          btc_trade_id?: string | null
          charge_status?: string
          created_at?: string
          id?: string
          match_amount_cents: number
          match_rule_id: string
          original_amount_cents: number
          recipient_user_id: string
          save_event_id: string
          sponsor_id: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          btc_price_usd?: number | null
          btc_quantity?: number | null
          btc_trade_id?: string | null
          charge_status?: string
          created_at?: string
          id?: string
          match_amount_cents?: number
          match_rule_id?: string
          original_amount_cents?: number
          recipient_user_id?: string
          save_event_id?: string
          sponsor_id?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_rule_id_fkey"
            columns: ["match_rule_id"]
            isOneToOne: false
            referencedRelation: "match_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_save_event_id_fkey"
            columns: ["save_event_id"]
            isOneToOne: false
            referencedRelation: "save_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      match_invites: {
        Row: {
          amount_cents: number
          created_at: string
          expires_at: string
          id: string
          invitee_id: string
          inviter_id: string
          message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          expires_at?: string
          id?: string
          invitee_id: string
          inviter_id: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          expires_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      match_rules: {
        Row: {
          asset_type: string
          cap_cents_weekly: number
          created_at: string
          id: string
          percent: number
          recipient_user_id: string
          sponsor_id: string
          status: string
          updated_at: string
        }
        Insert: {
          asset_type?: string
          cap_cents_weekly?: number
          created_at?: string
          id?: string
          percent: number
          recipient_user_id: string
          sponsor_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          cap_cents_weekly?: number
          created_at?: string
          id?: string
          percent?: number
          recipient_user_id?: string
          sponsor_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_rules_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          id: string
          match_enabled: boolean
          max_daily_pushes: number
          max_weekly_pushes: number
          payday_enabled: boolean
          push_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          roundup_enabled: boolean
          streak_enabled: boolean
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_enabled?: boolean
          max_daily_pushes?: number
          max_weekly_pushes?: number
          payday_enabled?: boolean
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          roundup_enabled?: boolean
          streak_enabled?: boolean
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_enabled?: boolean
          max_daily_pushes?: number
          max_weekly_pushes?: number
          payday_enabled?: boolean
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          roundup_enabled?: boolean
          streak_enabled?: boolean
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_suggestions: {
        Row: {
          amount_cents: number | null
          cadence: string | null
          created_at: string
          emoji: string | null
          id: string
          is_applied: boolean
          suggestion_type: string
          target_cents: number | null
          title: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          cadence?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          is_applied?: boolean
          suggestion_type: string
          target_cents?: number | null
          title: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          cadence?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          is_applied?: boolean
          suggestion_type?: string
          target_cents?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payday_rules: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          is_active: boolean
          next_run_at: string
          stacklet_id: string
          trigger_cadence: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          is_active?: boolean
          next_run_at: string
          stacklet_id: string
          trigger_cadence: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          is_active?: boolean
          next_run_at?: string
          stacklet_id?: string
          trigger_cadence?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payday_rules_stacklet_id_fkey"
            columns: ["stacklet_id"]
            isOneToOne: false
            referencedRelation: "stacklets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_year: number | null
          bonus_access_until: string | null
          completed_onboarding: boolean | null
          created_at: string
          default_splits: Json | null
          display_name: string | null
          email: string | null
          has_budget: boolean | null
          has_contacts: boolean | null
          has_linked_account: boolean | null
          id: string
          in_group: boolean | null
          last_route: string | null
          lightning_address: string | null
          mode: string | null
          onboarding_completed_at: string | null
          parent_email: string | null
          phone: string | null
          plan: string | null
          pro_access_until: string | null
          stripe_customer_id: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_year?: number | null
          bonus_access_until?: string | null
          completed_onboarding?: boolean | null
          created_at?: string
          default_splits?: Json | null
          display_name?: string | null
          email?: string | null
          has_budget?: boolean | null
          has_contacts?: boolean | null
          has_linked_account?: boolean | null
          id: string
          in_group?: boolean | null
          last_route?: string | null
          lightning_address?: string | null
          mode?: string | null
          onboarding_completed_at?: string | null
          parent_email?: string | null
          phone?: string | null
          plan?: string | null
          pro_access_until?: string | null
          stripe_customer_id?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_year?: number | null
          bonus_access_until?: string | null
          completed_onboarding?: boolean | null
          created_at?: string
          default_splits?: Json | null
          display_name?: string | null
          email?: string | null
          has_budget?: boolean | null
          has_contacts?: boolean | null
          has_linked_account?: boolean | null
          id?: string
          in_group?: boolean | null
          last_route?: string | null
          lightning_address?: string | null
          mode?: string | null
          onboarding_completed_at?: string | null
          parent_email?: string | null
          phone?: string | null
          plan?: string | null
          pro_access_until?: string | null
          stripe_customer_id?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_action_logs: {
        Row: {
          action: string
          action_data: Json | null
          created_at: string
          id: string
          push_event_id: string
          user_id: string
        }
        Insert: {
          action: string
          action_data?: Json | null
          created_at?: string
          id?: string
          push_event_id: string
          user_id: string
        }
        Update: {
          action?: string
          action_data?: Json | null
          created_at?: string
          id?: string
          push_event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_action_logs_push_event_id_fkey"
            columns: ["push_event_id"]
            isOneToOne: false
            referencedRelation: "push_events"
            referencedColumns: ["id"]
          },
        ]
      }
      push_events: {
        Row: {
          acted_at: string | null
          created_at: string
          id: string
          payload: Json
          scheduled_for: string | null
          sent_at: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acted_at?: string | null
          created_at?: string
          id?: string
          payload: Json
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acted_at?: string | null
          created_at?: string
          id?: string
          payload?: Json
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_metrics: {
        Row: {
          created_at: string
          event: string
          id: string
          profile_id: string
          push_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          profile_id: string
          push_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          profile_id?: string
          push_id?: string
        }
        Relationships: []
      }
      referral_events: {
        Row: {
          event_type: string
          id: string
          metadata: Json | null
          occurred_at: string
          referral_id: string
          referred_user_id: string | null
        }
        Insert: {
          event_type: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          referral_id: string
          referred_user_id?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          referral_id?: string
          referred_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referred_user_id: string | null
          referrer_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          id: string
          is_applied: boolean | null
          months_granted: number | null
          reward_reason: string | null
          reward_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          is_applied?: boolean | null
          months_granted?: number | null
          reward_reason?: string | null
          reward_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          is_applied?: boolean | null
          months_granted?: number | null
          reward_reason?: string | null
          reward_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      roundup_accumulator: {
        Row: {
          accumulated_cents: number
          auto_convert_enabled: boolean
          created_at: string
          id: string
          last_transaction_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accumulated_cents?: number
          auto_convert_enabled?: boolean
          created_at?: string
          id?: string
          last_transaction_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accumulated_cents?: number
          auto_convert_enabled?: boolean
          created_at?: string
          id?: string
          last_transaction_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      save_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          save_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          save_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          save_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "save_comments_save_id_fkey"
            columns: ["save_id"]
            isOneToOne: false
            referencedRelation: "saves"
            referencedColumns: ["id"]
          },
        ]
      }
      save_events: {
        Row: {
          amount_cents: number
          created_at: string
          future_value_cents: number | null
          id: string
          note: string | null
          reason: string | null
          source: string
          stacklet_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          future_value_cents?: number | null
          id?: string
          note?: string | null
          reason?: string | null
          source?: string
          stacklet_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          future_value_cents?: number | null
          id?: string
          note?: string | null
          reason?: string | null
          source?: string
          stacklet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "save_events_stacklet_id_fkey"
            columns: ["stacklet_id"]
            isOneToOne: false
            referencedRelation: "stacklets"
            referencedColumns: ["id"]
          },
        ]
      }
      save_likes: {
        Row: {
          created_at: string
          id: string
          save_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          save_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          save_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "save_likes_save_id_fkey"
            columns: ["save_id"]
            isOneToOne: false
            referencedRelation: "saves"
            referencedColumns: ["id"]
          },
        ]
      }
      save_matches: {
        Row: {
          amount_cents: number
          btc_sats: number | null
          created_at: string
          id: string
          matcher_user_id: string
          save_id: string
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
        }
        Insert: {
          amount_cents: number
          btc_sats?: number | null
          created_at?: string
          id?: string
          matcher_user_id: string
          save_id: string
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          btc_sats?: number | null
          created_at?: string
          id?: string
          matcher_user_id?: string
          save_id?: string
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "save_matches_save_id_fkey"
            columns: ["save_id"]
            isOneToOne: false
            referencedRelation: "saves"
            referencedColumns: ["id"]
          },
        ]
      }
      save_streaks: {
        Row: {
          current_streak: number | null
          last_save_date: string | null
          longest_streak: number | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          last_save_date?: string | null
          longest_streak?: number | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          last_save_date?: string | null
          longest_streak?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "save_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saves: {
        Row: {
          amount_cents: number
          btc_sats: number | null
          convert_to_btc: boolean
          created_at: string
          id: string
          reason: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          btc_sats?: number | null
          convert_to_btc?: boolean
          created_at?: string
          id?: string
          reason: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          btc_sats?: number | null
          convert_to_btc?: boolean
          created_at?: string
          id?: string
          reason?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      stacklets: {
        Row: {
          asset_type: string
          created_at: string
          deadline_date: string | null
          emoji: string
          id: string
          is_archived: boolean
          progress_cents: number
          target_cents: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type?: string
          created_at?: string
          deadline_date?: string | null
          emoji?: string
          id?: string
          is_archived?: boolean
          progress_cents?: number
          target_cents?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          deadline_date?: string | null
          emoji?: string
          id?: string
          is_archived?: boolean
          progress_cents?: number
          target_cents?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      streak_types: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          is_active: boolean
          last_activity_date: string | null
          longest_streak: number
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          is_active?: boolean
          last_activity_date?: string | null
          longest_streak?: number
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          is_active?: boolean
          last_activity_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      streak_windows: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          partner_user_id: string | null
          start_date: string
          streak_length: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          partner_user_id?: string | null
          start_date: string
          streak_length?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          partner_user_id?: string | null
          start_date?: string
          streak_length?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      streaks_daily: {
        Row: {
          created_at: string | null
          id: string
          save_count: number | null
          streak_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          save_count?: number | null
          streak_date: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          save_count?: number | null
          streak_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_tier"]
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      table_name: {
        Row: {
          data: Json | null
          id: number
          inserted_at: string
          name: string | null
          updated_at: string
        }
        Insert: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      template_purchases: {
        Row: {
          amount_cents: number
          id: string
          purchase_date: string
          status: string
          stripe_payment_intent_id: string | null
          template_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          id?: string
          purchase_date?: string
          status?: string
          stripe_payment_intent_id?: string | null
          template_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          id?: string
          purchase_date?: string
          status?: string
          stripe_payment_intent_id?: string | null
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_purchases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "budget_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_cents: number
          created_at: string
          description: string | null
          id: string
          occurred_at: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          description?: string | null
          id?: string
          occurred_at?: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          description?: string | null
          id?: string
          occurred_at?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          projection_rate_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          projection_rate_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          projection_rate_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          consecutive_days: number
          id: string
          is_active: boolean
          last_action_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          consecutive_days?: number
          id?: string
          is_active?: boolean
          last_action_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          consecutive_days?: number
          id?: string
          is_active?: boolean
          last_action_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      weekly_budget_lines: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
          weekly_amount: number
          weekly_budget_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: string
          weekly_amount: number
          weekly_budget_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          weekly_amount?: number
          weekly_budget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_budget_lines_weekly_budget_id_fkey"
            columns: ["weekly_budget_id"]
            isOneToOne: false
            referencedRelation: "weekly_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_budgets: {
        Row: {
          created_at: string | null
          fixed_weekly: number
          id: string
          income_weekly: number
          save_n_stack: number
          sinking_weekly: number
          updated_at: string | null
          user_id: string
          variable_total: number
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          fixed_weekly?: number
          id?: string
          income_weekly?: number
          save_n_stack?: number
          sinking_weekly?: number
          updated_at?: string | null
          user_id: string
          variable_total?: number
          week_end_date: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          fixed_weekly?: number
          id?: string
          income_weekly?: number
          save_n_stack?: number
          sinking_weekly?: number
          updated_at?: string | null
          user_id?: string
          variable_total?: number
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_weekly: {
        Row: {
          current_streak: number | null
          display_name: string | null
          saves_count: number | null
          total_saved_cents: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_and_award_badges: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      create_onboarding_suggestions: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      decrypt_sensitive_data: {
        Args: { encrypted_obj: Json; key_name: string }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { key_name: string; plain_text: string }
        Returns: Json
      }
      generate_group_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_community_stats: {
        Args: { target_user_id: string }
        Returns: {
          active_sponsors_count: number
          current_streak: number
          recent_match_events: Json
          total_matched_cents: number
          total_saved_cents: number
          total_saves_count: number
        }[]
      }
      get_week_start: {
        Args: { input_date?: string }
        Returns: string
      }
      get_weekly_match_spend: {
        Args: { rule_id: string; week_start: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_parent_of: {
        Args: { child: string }
        Returns: boolean
      }
      update_user_streak: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      verify_deep_link_signature: {
        Args: {
          amount_cents: number
          expires_at: string
          provided_sig: string
          push_id: string
          source: string
        }
        Returns: boolean
      }
    }
    Enums: {
      ai_message_role: "user" | "assistant" | "system"
      app_role: "student" | "teacher" | "admin"
      event_status: "scheduled" | "canceled" | "completed"
      goal_status: "active" | "completed" | "archived"
      invoice_status: "draft" | "open" | "paid" | "void" | "uncollectible"
      match_status: "pledged" | "sent" | "canceled"
      plan_tier: "free" | "pro" | "family"
      post_visibility: "public" | "private"
      transaction_type: "debit" | "credit"
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
      ai_message_role: ["user", "assistant", "system"],
      app_role: ["student", "teacher", "admin"],
      event_status: ["scheduled", "canceled", "completed"],
      goal_status: ["active", "completed", "archived"],
      invoice_status: ["draft", "open", "paid", "void", "uncollectible"],
      match_status: ["pledged", "sent", "canceled"],
      plan_tier: ["free", "pro", "family"],
      post_visibility: ["public", "private"],
      transaction_type: ["debit", "credit"],
    },
  },
} as const
