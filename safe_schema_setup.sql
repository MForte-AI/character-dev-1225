-- SAFE DATABASE SCHEMA SETUP
-- Run this in sections to avoid conflicts

-- ===== SECTION 1: EXTENSIONS & FUNCTIONS =====
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA extensions;

-- Function to update modified column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now(); 
    RETURN NEW; 
END;
$$ language 'plpgsql';

-- ===== SECTION 2: CORE TABLES =====
-- Only create tables if they don't exist

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    bio TEXT NOT NULL DEFAULT '' CHECK (char_length(bio) <= 500),
    has_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT NOT NULL DEFAULT '' CHECK (char_length(image_url) <= 1000),
    image_path TEXT NOT NULL DEFAULT '' CHECK (char_length(image_path) <= 1000),
    profile_context TEXT NOT NULL DEFAULT '' CHECK (char_length(profile_context) <= 1500),
    display_name TEXT NOT NULL DEFAULT '' CHECK (char_length(display_name) <= 100),
    use_azure_openai BOOLEAN NOT NULL DEFAULT FALSE,
    username TEXT NOT NULL UNIQUE CHECK (char_length(username) >= 3 AND char_length(username) <= 25),
    anthropic_api_key TEXT CHECK (char_length(anthropic_api_key) <= 1000),
    azure_openai_35_turbo_id TEXT CHECK (char_length(azure_openai_35_turbo_id) <= 1000),
    azure_openai_45_turbo_id TEXT CHECK (char_length(azure_openai_45_turbo_id) <= 1000),
    azure_openai_45_vision_id TEXT CHECK (char_length(azure_openai_45_vision_id) <= 1000),
    azure_openai_api_key TEXT CHECK (char_length(azure_openai_api_key) <= 1000),
    azure_openai_endpoint TEXT CHECK (char_length(azure_openai_endpoint) <= 1000),
    google_gemini_api_key TEXT CHECK (char_length(google_gemini_api_key) <= 1000),
    mistral_api_key TEXT CHECK (char_length(mistral_api_key) <= 1000),
    openai_api_key TEXT CHECK (char_length(openai_api_key) <= 1000),
    openai_organization_id TEXT CHECK (char_length(openai_organization_id) <= 1000),
    perplexity_api_key TEXT CHECK (char_length(perplexity_api_key) <= 1000),
    openrouter_api_key TEXT CHECK (char_length(openrouter_api_key) <= 1000),
    azure_openai_embeddings_id TEXT CHECK (char_length(azure_openai_embeddings_id) <= 1000),
    groq_api_key TEXT CHECK (char_length(groq_api_key) <= 1000),
    azure_openai_45_o_id TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    default_context_length INTEGER NOT NULL DEFAULT 4096,
    default_model TEXT NOT NULL DEFAULT 'gpt-4' CHECK (char_length(default_model) <= 1000),
    default_prompt TEXT NOT NULL DEFAULT '' CHECK (char_length(default_prompt) <= 100000),
    default_temperature REAL NOT NULL DEFAULT 0.5,
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
    embeddings_provider TEXT NOT NULL DEFAULT 'openai' CHECK (char_length(embeddings_provider) <= 1000),
    include_profile_context BOOLEAN NOT NULL DEFAULT TRUE,
    include_workspace_instructions BOOLEAN NOT NULL DEFAULT TRUE,
    instructions TEXT NOT NULL DEFAULT '' CHECK (char_length(instructions) <= 1500),
    is_home BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT NOT NULL DEFAULT 'Workspace' CHECK (char_length(name) <= 100),
    image_path TEXT DEFAULT '' NOT NULL CHECK (char_length(image_path) <= 1000)
);

CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    assistant_id UUID DEFAULT NULL,
    folder_id UUID DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    context_length INT NOT NULL DEFAULT 4096,
    embeddings_provider TEXT NOT NULL DEFAULT 'openai' CHECK (char_length(embeddings_provider) <= 1000),
    include_profile_context BOOLEAN NOT NULL DEFAULT TRUE,
    include_workspace_instructions BOOLEAN NOT NULL DEFAULT TRUE,
    model TEXT NOT NULL DEFAULT 'gpt-4' CHECK (char_length(model) <= 1000),
    name TEXT NOT NULL DEFAULT 'New Chat' CHECK (char_length(name) <= 200),
    prompt TEXT NOT NULL DEFAULT '' CHECK (char_length(prompt) <= 100000),
    temperature REAL NOT NULL DEFAULT 0.5
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assistant_id UUID DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    content TEXT NOT NULL CHECK (char_length(content) <= 1000000),
    image_paths TEXT[] NOT NULL DEFAULT '{}',
    model TEXT NOT NULL DEFAULT 'gpt-4' CHECK (char_length(model) <= 1000),
    role TEXT NOT NULL CHECK (char_length(role) <= 1000),
    sequence_number INT NOT NULL,
    CONSTRAINT check_image_paths_length CHECK (array_length(image_paths, 1) <= 16)
);

-- ===== SECTION 3: ENABLE RLS =====
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;