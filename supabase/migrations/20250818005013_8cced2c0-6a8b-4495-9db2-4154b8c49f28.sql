-- Add mode column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mode text CHECK (mode IN ('standard','educational')) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS birth_year int,
ADD COLUMN IF NOT EXISTS parent_email text;

-- Family groups table
CREATE TABLE IF NOT EXISTS family_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Family group members table
CREATE TABLE IF NOT EXISTS family_group_members (
  group_id uuid REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text CHECK (role IN ('parent','child')) NOT NULL,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Family group invitations table
CREATE TABLE IF NOT EXISTS family_group_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES family_groups(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  role text CHECK (role IN ('child')) NOT NULL,
  status text CHECK (status IN ('pending','accepted','expired')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Encouragements table (parent => child)
CREATE TABLE IF NOT EXISTS encouragements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES family_groups(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  emoji text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Demo wallet for Educational mode
CREATE TABLE IF NOT EXISTS demo_wallets (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance_cents bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Demo transactions for Educational mode
CREATE TABLE IF NOT EXISTS demo_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL,
  type text CHECK (type IN ('save','reward','adjustment')) NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Save streaks table
CREATE TABLE IF NOT EXISTS save_streaks (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak int DEFAULT 0,
  longest_streak int DEFAULT 0,
  last_save_date date
);

-- Helper functions
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT auth.uid()
$$;

-- Function to check if current user is parent of child
CREATE OR REPLACE FUNCTION public.is_parent_of(child uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1
    FROM family_group_members m_parent
    JOIN family_group_members m_child
      ON m_parent.group_id = m_child.group_id
    WHERE m_parent.user_id = auth.uid()
      AND m_parent.role = 'parent'
      AND m_child.user_id = child
      AND m_child.role = 'child'
  );
$$;

-- Enable RLS on all new tables
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_groups
CREATE POLICY "groups_select_members"
  ON family_groups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM family_group_members gm
    WHERE gm.group_id = family_groups.id
      AND gm.user_id = auth.uid()
  ));

CREATE POLICY "groups_insert_owner"
  ON family_groups FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- RLS Policies for family_group_members
CREATE POLICY "members_select_self_group"
  ON family_group_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM family_group_members gm
    WHERE gm.group_id = family_group_members.group_id
      AND gm.user_id = auth.uid()
  ));

CREATE POLICY "members_insert_owner_only"
  ON family_group_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM family_groups g
    WHERE g.id = family_group_members.group_id
      AND g.owner_user_id = auth.uid()
  ));

CREATE POLICY "members_delete_owner_only"
  ON family_group_members FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM family_groups g
    WHERE g.id = family_group_members.group_id
      AND g.owner_user_id = auth.uid()
  ));

-- RLS Policies for family_group_invites
CREATE POLICY "invites_select_owner_or_invitee"
  ON family_group_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_groups g
      WHERE g.id = family_group_invites.group_id
        AND g.owner_user_id = auth.uid()
    )
    OR LOWER(family_group_invites.invitee_email) = LOWER(auth.jwt() ->> 'email')
  );

CREATE POLICY "invites_insert_owner_only"
  ON family_group_invites FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM family_groups g
    WHERE g.id = family_group_invites.group_id
      AND g.owner_user_id = auth.uid()
  ));

CREATE POLICY "invites_update_owner_or_invitee_accept"
  ON family_group_invites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_groups g
      WHERE g.id = family_group_invites.group_id
        AND g.owner_user_id = auth.uid()
    )
    OR LOWER(family_group_invites.invitee_email) = LOWER(auth.jwt() ->> 'email')
  );

-- RLS Policies for encouragements
CREATE POLICY "encouragements_select_same_group"
  ON encouragements FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM family_group_members gm
      WHERE gm.group_id = encouragements.group_id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "encouragements_insert_parent_to_child"
  ON encouragements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_group_members gm_p
      WHERE gm_p.group_id = encouragements.group_id
        AND gm_p.user_id = auth.uid()
        AND gm_p.role = 'parent'
    )
    AND EXISTS (
      SELECT 1 FROM family_group_members gm_c
      WHERE gm_c.group_id = encouragements.group_id
        AND gm_c.user_id = encouragements.to_user_id
        AND gm_c.role = 'child'
    )
    AND from_user_id = auth.uid()
  );

-- RLS Policies for demo_wallets
CREATE POLICY "wallet_select_owner_or_parent"
  ON demo_wallets FOR SELECT
  USING (user_id = auth.uid() OR public.is_parent_of(user_id));

CREATE POLICY "wallet_upsert_owner_only"
  ON demo_wallets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "wallet_update_owner_only"
  ON demo_wallets FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for demo_transactions
CREATE POLICY "tx_select_owner_or_parent"
  ON demo_transactions FOR SELECT
  USING (user_id = auth.uid() OR public.is_parent_of(user_id));

CREATE POLICY "tx_insert_owner_only"
  ON demo_transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for save_streaks
CREATE POLICY "streaks_select_owner_or_parent"
  ON save_streaks FOR SELECT
  USING (user_id = auth.uid() OR public.is_parent_of(user_id));

CREATE POLICY "streaks_upsert_owner_only"
  ON save_streaks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "streaks_update_owner_only"
  ON save_streaks FOR UPDATE
  USING (user_id = auth.uid());

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_members_user ON family_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_group ON family_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON family_group_invites(LOWER(invitee_email));
CREATE INDEX IF NOT EXISTS idx_wallets_user ON demo_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_user_time ON demo_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_streaks_user ON save_streaks(user_id);

-- Add trigger for demo wallet updates
CREATE OR REPLACE FUNCTION update_demo_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER demo_wallets_updated_at
  BEFORE UPDATE ON demo_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_demo_wallet_timestamp();