-- Minimal ChatBot UI Schema for Quick Start
-- Run this first to get basic functionality working

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now(); 
    RETURN NEW; 
END;
$$ language 'plpgsql';

-- Core NextAuth tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE,
    email_verified TIMESTAMPTZ,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Core app tables
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    bio TEXT NOT NULL DEFAULT '',
    has_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT DEFAULT '',
    image_path TEXT DEFAULT '',
    profile_context TEXT NOT NULL DEFAULT '',
    display_name TEXT NOT NULL,
    use_azure_openai BOOLEAN NOT NULL DEFAULT FALSE,
    username TEXT NOT NULL UNIQUE,
    anthropic_api_key TEXT DEFAULT '',
    azure_openai_api_key TEXT DEFAULT '',
    google_gemini_api_key TEXT DEFAULT '',
    mistral_api_key TEXT DEFAULT '',
    openai_api_key TEXT DEFAULT '',
    groq_api_key TEXT DEFAULT '',
    openrouter_api_key TEXT DEFAULT ''
);

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    default_context_length INTEGER NOT NULL DEFAULT 4096,
    default_model TEXT NOT NULL DEFAULT 'gpt-4-1106-preview',
    default_prompt TEXT NOT NULL DEFAULT 'You are a friendly, helpful AI assistant.',
    default_temperature REAL NOT NULL DEFAULT 0.5,
    description TEXT NOT NULL DEFAULT '',
    embeddings_provider TEXT NOT NULL DEFAULT 'openai',
    include_profile_context BOOLEAN NOT NULL DEFAULT TRUE,
    include_workspace_instructions BOOLEAN NOT NULL DEFAULT TRUE,
    instructions TEXT NOT NULL DEFAULT '',
    is_home BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT NOT NULL
);

CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    context_length INTEGER NOT NULL DEFAULT 4096,
    embeddings_provider TEXT NOT NULL DEFAULT 'openai',
    include_profile_context BOOLEAN NOT NULL DEFAULT TRUE,
    include_workspace_instructions BOOLEAN NOT NULL DEFAULT TRUE,
    model TEXT NOT NULL DEFAULT 'gpt-4-1106-preview',
    name TEXT NOT NULL,
    prompt TEXT NOT NULL DEFAULT '',
    temperature REAL NOT NULL DEFAULT 0.5
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    content TEXT NOT NULL,
    image_paths TEXT[] NOT NULL DEFAULT '{}',
    model TEXT NOT NULL,
    role TEXT NOT NULL,
    sequence_number INTEGER NOT NULL,
    tokens INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_accounts_user_id ON accounts (user_id);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_token ON sessions (session_token);
CREATE INDEX idx_profiles_user_id ON profiles (user_id);
CREATE INDEX idx_workspaces_user_id ON workspaces (user_id);
CREATE INDEX idx_chats_user_id ON chats (user_id);
CREATE INDEX idx_chats_workspace_id ON chats (workspace_id);
CREATE INDEX idx_messages_chat_id ON messages (chat_id);
CREATE INDEX idx_messages_user_id ON messages (user_id);

-- Unique constraints
CREATE UNIQUE INDEX idx_unique_home_workspace_per_user ON workspaces(user_id) WHERE is_home;

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column(); 