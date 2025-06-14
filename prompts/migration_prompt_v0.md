# Database Migration: Supabase to Google Cloud PostgreSQL

## Context
I'm migrating the chatbot-ui project (https://github.com/mckaywrigley/chatbot-ui) from Supabase to my own PostgreSQL database on Google Cloud. I want to keep the existing functionality while moving away from Supabase's managed database.

## Current State
- Using Next.js application with Supabase integration
- Database schema includes: profiles, workspaces, folders, files, assistants, chats, messages, prompts, collections
- Authentication currently handled by Supabase Auth
- Some migration progress already exists in `/migration` folder

## Migration Goals
1. **Database**: Move from Supabase PostgreSQL to Google Cloud PostgreSQL
2. **Schema**: Preserve all existing tables, relationships, and data structure
3. **Authentication**: Initially keep Supabase Auth (migrate later)
4. **Storage**: Keep Supabase Storage initially
5. **Code**: Update database connection and queries to use new PostgreSQL instance

## Technical Requirements
- Maintain Row Level Security (RLS) policies where applicable
- Preserve all database triggers and functions
- Update Supabase client configuration to point to new database
- Keep API structure intact for frontend compatibility
- Ensure proper connection pooling and environment variable management

## Specific Tasks Needed
1. **Schema Analysis**: Review all 12 migration files from `supabase/migrations/` and create equivalent PostgreSQL schema
2. **Connection Setup**: Configure database connection to Google Cloud PostgreSQL
3. **RLS Migration**: Implement equivalent security policies in standalone PostgreSQL
4. **API Layer**: Update Supabase client calls to work with new database
5. **Environment Variables**: Update configuration for new database connection
6. **Testing Strategy**: Ensure all existing functionality works with new database

## Files to Focus On
- All files in `supabase/migrations/` directory
- Database configuration in `lib/supabase/` 
- Any files importing from `@supabase/supabase-js`
- Environment configuration files

## Questions to Address
1. How to handle Supabase-specific functions (like `supabase.auth.getUser()`) when keeping Supabase Auth but using custom DB?
2. What's the best way to implement RLS policies in standalone PostgreSQL?
3. How to maintain real-time functionality without Supabase's real-time subscriptions?
4. Should I use a PostgreSQL connection library like `pg` or keep parts of the Supabase client?

## Constraints
- Must maintain backward compatibility with existing data
- Frontend should require minimal changes
- Need proper error handling and logging
- Should support both development and production environments

Please provide a detailed migration plan with code examples, updated configuration files, and step-by-step implementation guidance.