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
