-- Verify Complete Migration Script
-- Run this after executing complete_schema.sql

\echo '🔍 Verifying migration...'
\echo ''

-- Check if all core tables exist
\echo '📊 Checking NextAuth.js tables:'
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') as users_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') as accounts_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') as sessions_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verification_tokens') as verification_tokens_exists;

\echo ''
\echo '📊 Checking ChatBot UI core tables:'
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') as profiles_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces') as workspaces_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') as chats_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') as messages_exists;

\echo ''
\echo '📊 Checking advanced feature tables:'
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assistants') as assistants_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'files') as files_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tools') as tools_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collections') as collections_exists;

\echo ''
\echo '📊 Table count summary:'
SELECT COUNT(*) as total_tables_created 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name NOT LIKE 'pg_%';

\echo ''
\echo '📊 Index count:'
SELECT COUNT(*) as total_indexes_created 
FROM pg_indexes 
WHERE schemaname = 'public';

\echo ''
\echo '📊 Trigger count:'
SELECT COUNT(*) as total_triggers_created 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

\echo ''
\echo '✅ Migration verification complete!' 