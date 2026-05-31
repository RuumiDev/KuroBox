-- ============================================================
-- KuroBox — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- Profiles Table (auto-linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id         UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE,
    username   TEXT UNIQUE
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Boards Table
CREATE TABLE IF NOT EXISTS boards (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title             TEXT NOT NULL,
    config            JSONB DEFAULT '{"view":"kanban","visible_attributes":["title","status"],"column_order":[]}'::jsonb NOT NULL,
    schema_definition JSONB DEFAULT '{"attributes":[]}'::jsonb NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boards_select_own" ON boards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "boards_insert_own" ON boards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "boards_update_own" ON boards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "boards_delete_own" ON boards FOR DELETE USING (auth.uid() = user_id);

-- Cards Table
CREATE TABLE IF NOT EXISTS cards (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id        UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
    status          TEXT NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    attributes_data JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_select_own" ON cards FOR SELECT USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = cards.board_id AND boards.user_id = auth.uid())
);
CREATE POLICY "cards_insert_own" ON cards FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_id AND boards.user_id = auth.uid())
);
CREATE POLICY "cards_update_own" ON cards FOR UPDATE USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = cards.board_id AND boards.user_id = auth.uid())
);
CREATE POLICY "cards_delete_own" ON cards FOR DELETE USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = cards.board_id AND boards.user_id = auth.uid())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards (user_id);
CREATE INDEX IF NOT EXISTS idx_cards_board_id ON cards (board_id);
CREATE INDEX IF NOT EXISTS idx_cards_board_status ON cards (board_id, status);

-- Auto-create profile row on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, updated_at)
    VALUES (NEW.id, now())
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- v2.0 PRO-MAX MIGRATIONS
-- Run these in the Supabase SQL editor if upgrading an existing DB.
-- Safe to run on a fresh schema as well (uses IF NOT EXISTS / ALTER … IF NOT EXISTS).
-- ============================================================

-- Boards: native pipeline column sequence storage
ALTER TABLE boards
    ADD COLUMN IF NOT EXISTS pipeline_columns JSONB
    DEFAULT '["Applied","Viewed","Interview","Offer","Rejected"]'::jsonb NOT NULL;

-- Cards: ensure status is always set + add schema_layout_order for field rendering
ALTER TABLE cards ALTER COLUMN status SET NOT NULL;
ALTER TABLE cards ALTER COLUMN status SET DEFAULT 'Default';

ALTER TABLE cards
    ADD COLUMN IF NOT EXISTS schema_layout_order INT NOT NULL DEFAULT 0;

-- Index on schema_layout_order for ordered fetches
CREATE INDEX IF NOT EXISTS idx_cards_schema_layout_order ON cards (board_id, schema_layout_order);

-- ── Cascade reallocation helper ───────────────────────────────────────────────
-- Called by the server-side migration path when a pipeline column is deleted.
-- The frontend performs the same logic optimistically; this function handles
-- server-side batch corrections and can be called via a Supabase Edge Function.
CREATE OR REPLACE FUNCTION reallocate_orphaned_cards(
    target_board_id UUID,
    old_status      TEXT,
    new_status      TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE cards
    SET
        status     = new_status,
        updated_at = timezone('utc'::text, now())
    WHERE
        board_id = target_board_id
        AND status = old_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
