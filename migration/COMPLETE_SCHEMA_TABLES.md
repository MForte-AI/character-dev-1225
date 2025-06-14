# Complete Schema Migration - Table Reference

## 🏗️ What Gets Created

### NextAuth.js Authentication Tables
- ✅ `users` - User accounts
- ✅ `accounts` - OAuth provider accounts
- ✅ `sessions` - User sessions (database-based)
- ✅ `verification_tokens` - Email verification tokens

### Core ChatBot UI Tables
- ✅ `profiles` - User profiles with API keys
- ✅ `workspaces` - User workspaces
- ✅ `folders` - Organization folders
- ✅ `files` - Uploaded files
- ✅ `file_items` - Processed file chunks with embeddings
- ✅ `assistants` - AI assistants
- ✅ `chats` - Chat conversations
- ✅ `messages` - Individual messages
- ✅ `prompts` - Reusable prompt templates
- ✅ `collections` - File collections for RAG
- ✅ `presets` - Chat presets
- ✅ `tools` - Custom tools for function calling
- ✅ `models` - Custom model configurations

### Junction Tables (Many-to-Many Relationships)
- ✅ `assistant_collections` - Assistants ↔ Collections
- ✅ `assistant_files` - Assistants ↔ Files
- ✅ `assistant_tools` - Assistants ↔ Tools
- ✅ `chat_files` - Chats ↔ Files
- ✅ `collection_files` - Collections ↔ Files
- ✅ `message_file_items` - Messages ↔ File Items

## 🎯 Features Available After Migration

### ✅ Core Features
- User authentication with Google OAuth
- Profile management with API keys
- Workspace creation and management
- Chat creation and messaging
- File upload and processing

### ✅ Advanced Features
- AI Assistants with custom instructions
- File collections for RAG
- Custom prompts and presets
- Function calling with custom tools
- Custom model configurations
- Folder organization
- File sharing and permissions

### ✅ Extensions & Integrations
- Vector embeddings (pgvector)
- Multiple AI providers (OpenAI, Anthropic, Google, etc.)
- File processing with chunking
- Real-time updates (via database triggers)

## 📊 Total Tables: 20+

This gives you **100% feature parity** with your current Supabase setup! 