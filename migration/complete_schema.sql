-- ChatBot UI Complete Schema Migration for Google Cloud PostgreSQL
-- Migrated from Supabase to standard PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update modified column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now(); 
    RETURN NEW; 
END;
$$ language 'plpgsql';

-- Function to delete messages including and after a sequence number
CREATE OR REPLACE FUNCTION delete_messages_including_and_after(
    p_user_id UUID, 
    p_chat_id UUID, 
    p_sequence_number INT
)
RETURNS VOID AS $$
BEGIN
    DELETE FROM messages 
    WHERE user_id = p_user_id AND chat_id = p_chat_id AND sequence_number >= p_sequence_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NEXTAUTH.JS TABLES (Authentication)
-- ============================================

-- Users table for NextAuth.js
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE,
    email_verified TIMESTAMPTZ,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table for NextAuth.js
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

-- Sessions table for NextAuth.js
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Verification tokens for NextAuth.js
CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ============================================
-- CHATBOT UI CORE TABLES
-- ============================================

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    bio TEXT NOT NULL DEFAULT '' CHECK (char_length(bio) <= 500),
    has_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT DEFAULT '' CHECK (char_length(image_url) <= 1000),
    image_path TEXT DEFAULT '' CHECK (char_length(image_path) <= 1000),
    profile_context TEXT NOT NULL DEFAULT '' CHECK (char_length(profile_context) <= 1500),
    display_name TEXT NOT NULL CHECK (char_length(display_name) <= 100),
    use_azure_openai BOOLEAN NOT NULL DEFAULT FALSE,
    username TEXT NOT NULL UNIQUE CHECK (char_length(username) >= 3 AND char_length(username) <= 25),
    anthropic_api_key TEXT DEFAULT '' CHECK (char_length(anthropic_api_key) <= 1000),
    azure_openai_35_turbo_id TEXT DEFAULT '' CHECK (char_length(azure_openai_35_turbo_id) <= 1000),
    azure_openai_45_turbo_id TEXT DEFAULT '' CHECK (char_length(azure_openai_45_turbo_id) <= 1000),
    azure_openai_45_vision_id TEXT DEFAULT '' CHECK (char_length(azure_openai_45_vision_id) <= 1000),
    azure_openai_api_key TEXT DEFAULT '' CHECK (char_length(azure_openai_api_key) <= 1000),
    azure_openai_endpoint TEXT DEFAULT '' CHECK (char_length(azure_openai_endpoint) <= 1000),
    google_gemini_api_key TEXT DEFAULT '' CHECK (char_length(google_gemini_api_key) <= 1000),
    mistral_api_key TEXT DEFAULT '' CHECK (char_length(mistral_api_key) <= 1000),
    openai_api_key TEXT DEFAULT '' CHECK (char_length(openai_api_key) <= 1000),
    openai_organization_id TEXT DEFAULT '' CHECK (char_length(openai_organization_id) <= 1000),
    perplexity_api_key TEXT DEFAULT '' CHECK (char_length(perplexity_api_key) <= 1000),
    groq_api_key TEXT DEFAULT '' CHECK (char_length(groq_api_key) <= 1000),
    openrouter_api_key TEXT DEFAULT '' CHECK (char_length(openrouter_api_key) <= 1000)
);

-- Workspaces table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    default_context_length INTEGER NOT NULL DEFAULT 4096,
    default_model TEXT NOT NULL DEFAULT 'gpt-4-1106-preview' CHECK (char_length(default_model) <= 1000),
    default_prompt TEXT NOT NULL DEFAULT 'You are a friendly, helpful AI assistant.' CHECK (char_length(default_prompt) <= 100000),
    default_temperature REAL NOT NULL DEFAULT 0.5,
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
    embeddings_provider TEXT NOT NULL DEFAULT 'openai' CHECK (char_length(embeddings_provider) <= 1000),
    include_profile_context BOOLEAN NOT NULL DEFAULT TRUE,
    include_workspace_instructions BOOLEAN NOT NULL DEFAULT TRUE,
    instructions TEXT NOT NULL DEFAULT '' CHECK (char_length(instructions) <= 1500),
    is_home BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    image_path TEXT DEFAULT '' CHECK (char_length(image_path) <= 1000)
);

-- Folders table
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    type TEXT NOT NULL CHECK (char_length(type) <= 100)
);

-- Files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    file_path TEXT NOT NULL CHECK (char_length(file_path) <= 1000),
    size INTEGER NOT NULL CHECK (size >= 0),
    tokens INTEGER NOT NULL DEFAULT 0 CHECK (tokens >= 0),
    type TEXT NOT NULL CHECK (char_length(type) <= 100)
);

-- File items table
CREATE TABLE file_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    content TEXT NOT NULL CHECK (char_length(content) <= 2000000),
    local_embedding vector(1536),
    openai_embedding vector(1536),
    tokens INTEGER NOT NULL DEFAULT 0 CHECK (tokens >= 0)
);

-- Assistants table
CREATE TABLE assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    context_length INTEGER NOT NULL DEFAULT 4096,
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
    embeddings_provider TEXT NOT NULL DEFAULT 'openai' CHECK (char_length(embeddings_provider) <= 1000),
    image_path TEXT DEFAULT '' CHECK (char_length(image_path) <= 1000),
    include_profile_context BOOLEAN NOT NULL DEFAULT TRUE,
    include_workspace_instructions BOOLEAN NOT NULL DEFAULT TRUE,
    instructions TEXT NOT NULL DEFAULT '' CHECK (char_length(instructions) <= 100000),
    model TEXT NOT NULL DEFAULT 'gpt-4-1106-preview' CHECK (char_length(model) <= 1000),
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    prompt TEXT NOT NULL DEFAULT '' CHECK (char_length(prompt) <= 100000),
    temperature REAL NOT NULL DEFAULT 0.5
);

-- Chats table
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    context_length INTEGER NOT NULL DEFAULT 4096,
    embeddings_provider TEXT NOT NULL DEFAULT 'openai' CHECK (char_length(embeddings_provider) <= 1000),
    include_profile_context BOOLEAN NOT NULL DEFAULT TRUE,
    include_workspace_instructions BOOLEAN NOT NULL DEFAULT TRUE,
    model TEXT NOT NULL DEFAULT 'gpt-4-1106-preview' CHECK (char_length(model) <= 1000),
    name TEXT NOT NULL CHECK (char_length(name) <= 200),
    prompt TEXT NOT NULL DEFAULT '' CHECK (char_length(prompt) <= 100000),
    temperature REAL NOT NULL DEFAULT 0.5
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    content TEXT NOT NULL CHECK (char_length(content) <= 1000000),
    image_paths TEXT[] NOT NULL DEFAULT '{}',
    model TEXT NOT NULL CHECK (char_length(model) <= 1000),
    role TEXT NOT NULL CHECK (char_length(role) <= 1000),
    sequence_number INTEGER NOT NULL,
    tokens INTEGER DEFAULT 0,
    CONSTRAINT check_image_paths_length CHECK (array_length(image_paths, 1) <= 16 OR image_paths = '{}')
);

-- Prompts table
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    content TEXT NOT NULL CHECK (char_length(content) <= 100000),
    name TEXT NOT NULL CHECK (char_length(name) <= 100)
);

-- Collections table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
    name TEXT NOT NULL CHECK (char_length(name) <= 100)
);

-- Presets table
CREATE TABLE presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    context_length INTEGER NOT NULL DEFAULT 4096,
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
    embeddings_provider TEXT NOT NULL DEFAULT 'openai' CHECK (char_length(embeddings_provider) <= 1000),
    include_profile_context BOOLEAN NOT NULL DEFAULT TRUE,
    include_workspace_instructions BOOLEAN NOT NULL DEFAULT TRUE,
    model TEXT NOT NULL DEFAULT 'gpt-4-1106-preview' CHECK (char_length(model) <= 1000),
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    prompt TEXT NOT NULL DEFAULT '' CHECK (char_length(prompt) <= 100000),
    temperature REAL NOT NULL DEFAULT 0.5
);

-- Tools table  
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    schema JSONB NOT NULL DEFAULT '{}',
    url TEXT NOT NULL CHECK (char_length(url) <= 1000),
    custom_headers JSONB NOT NULL DEFAULT '{}'
);

-- Models table
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    sharing TEXT NOT NULL DEFAULT 'private',
    api_key TEXT NOT NULL DEFAULT '' CHECK (char_length(api_key) <= 1000),
    base_url TEXT NOT NULL DEFAULT '' CHECK (char_length(base_url) <= 1000),
    description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
    model_id TEXT NOT NULL CHECK (char_length(model_id) <= 1000),
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    context_length INTEGER DEFAULT 4096
);

-- ============================================
-- JUNCTION TABLES (Many-to-Many relationships)
-- ============================================

-- Assistant collections
CREATE TABLE assistant_collections (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    PRIMARY KEY(assistant_id, collection_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- Assistant files
CREATE TABLE assistant_files (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    PRIMARY KEY(assistant_id, file_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- Assistant tools
CREATE TABLE assistant_tools (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    PRIMARY KEY(assistant_id, tool_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- Chat files
CREATE TABLE chat_files (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    PRIMARY KEY(chat_id, file_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- Collection files
CREATE TABLE collection_files (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    PRIMARY KEY(collection_id, file_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- Message file items
CREATE TABLE message_file_items (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_item_id UUID NOT NULL REFERENCES file_items(id) ON DELETE CASCADE,
    PRIMARY KEY(message_id, file_item_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================

-- Authentication indexes
CREATE INDEX idx_accounts_user_id ON accounts (user_id);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_token ON sessions (session_token);

-- Core table indexes
CREATE INDEX idx_profiles_user_id ON profiles (user_id);
CREATE INDEX idx_workspaces_user_id ON workspaces (user_id);
CREATE INDEX idx_folders_user_id ON folders (user_id);
CREATE INDEX idx_folders_workspace_id ON folders (workspace_id);
CREATE INDEX idx_files_user_id ON files (user_id);
CREATE INDEX idx_files_folder_id ON files (folder_id);
CREATE INDEX idx_file_items_user_id ON file_items (user_id);
CREATE INDEX idx_file_items_file_id ON file_items (file_id);
CREATE INDEX idx_assistants_user_id ON assistants (user_id);
CREATE INDEX idx_assistants_folder_id ON assistants (folder_id);
CREATE INDEX idx_chats_user_id ON chats (user_id);
CREATE INDEX idx_chats_workspace_id ON chats (workspace_id);
CREATE INDEX idx_messages_chat_id ON messages (chat_id);
CREATE INDEX idx_messages_user_id ON messages (user_id);
CREATE INDEX idx_prompts_user_id ON prompts (user_id);
CREATE INDEX idx_collections_user_id ON collections (user_id);
CREATE INDEX idx_presets_user_id ON presets (user_id);
CREATE INDEX idx_tools_user_id ON tools (user_id);
CREATE INDEX idx_models_user_id ON models (user_id);

-- Junction table indexes
CREATE INDEX idx_assistant_collections_assistant_id ON assistant_collections (assistant_id);
CREATE INDEX idx_assistant_collections_collection_id ON assistant_collections (collection_id);
CREATE INDEX idx_assistant_files_assistant_id ON assistant_files (assistant_id);
CREATE INDEX idx_assistant_files_file_id ON assistant_files (file_id);
CREATE INDEX idx_assistant_tools_assistant_id ON assistant_tools (assistant_id);
CREATE INDEX idx_assistant_tools_tool_id ON assistant_tools (tool_id);
CREATE INDEX idx_chat_files_chat_id ON chat_files (chat_id);
CREATE INDEX idx_chat_files_file_id ON chat_files (file_id);
CREATE INDEX idx_collection_files_collection_id ON collection_files (collection_id);
CREATE INDEX idx_collection_files_file_id ON collection_files (file_id);
CREATE INDEX idx_message_file_items_message_id ON message_file_items (message_id);
CREATE INDEX idx_message_file_items_file_item_id ON message_file_items (file_item_id);

-- Unique constraints
CREATE UNIQUE INDEX idx_unique_home_workspace_per_user ON workspaces(user_id) WHERE is_home;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_file_items_updated_at BEFORE UPDATE ON file_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_assistants_updated_at BEFORE UPDATE ON assistants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_presets_updated_at BEFORE UPDATE ON presets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_assistant_collections_updated_at BEFORE UPDATE ON assistant_collections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_assistant_files_updated_at BEFORE UPDATE ON assistant_files FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_assistant_tools_updated_at BEFORE UPDATE ON assistant_tools FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chat_files_updated_at BEFORE UPDATE ON chat_files FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_collection_files_updated_at BEFORE UPDATE ON collection_files FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_message_file_items_updated_at BEFORE UPDATE ON message_file_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Business logic triggers
CREATE OR REPLACE FUNCTION prevent_home_field_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_home IS DISTINCT FROM OLD.is_home THEN
    RAISE EXCEPTION 'Updating the home field of workspace is not allowed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_home_workspace_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_home THEN
    RAISE EXCEPTION 'Home workspace deletion is not allowed.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_update_of_home_field BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE PROCEDURE prevent_home_field_update();
CREATE TRIGGER prevent_home_workspace_deletion BEFORE DELETE ON workspaces FOR EACH ROW EXECUTE PROCEDURE prevent_home_workspace_deletion();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'NextAuth.js users table';
COMMENT ON TABLE accounts IS 'NextAuth.js accounts table for OAuth providers';
COMMENT ON TABLE sessions IS 'NextAuth.js sessions table for database sessions';
COMMENT ON TABLE verification_tokens IS 'NextAuth.js verification tokens';
COMMENT ON TABLE profiles IS 'User profiles with API keys and preferences';
COMMENT ON TABLE workspaces IS 'User workspaces containing chats and settings';
COMMENT ON TABLE folders IS 'Folders for organizing content within workspaces';
COMMENT ON TABLE files IS 'User uploaded files';
COMMENT ON TABLE file_items IS 'Processed chunks of files with embeddings';
COMMENT ON TABLE assistants IS 'AI assistants with custom instructions';
COMMENT ON TABLE chats IS 'Chat conversations';
COMMENT ON TABLE messages IS 'Individual messages within chats';
COMMENT ON TABLE prompts IS 'Reusable prompt templates';
COMMENT ON TABLE collections IS 'Collections of files for RAG';
COMMENT ON TABLE presets IS 'Chat presets with predefined settings';
COMMENT ON TABLE tools IS 'Custom tools for function calling';
COMMENT ON TABLE models IS 'Custom model configurations'; 