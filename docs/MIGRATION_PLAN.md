# ChatBot UI Migration Plan: Supabase → Google Cloud

## 🎯 Migration Overview

**Timeline**: 2-3 days  
**Goal**: Migrate from Supabase to Google Cloud PostgreSQL + Google OAuth + Google Cloud Storage  
**Priority**: Core functionality first, optimizations later

## 📋 Prerequisites Checklist

- ✅ Google Cloud PostgreSQL Database (running)
- ✅ Cloud SQL Proxy (configured)
- ⬜ Google Cloud Storage bucket
- ⬜ Google OAuth 2.0 credentials
- ⬜ NextAuth.js setup
- ⬜ Database schema migration
- ⬜ Application code updates

## 🏗️ Architecture Changes

### Before (Supabase)
```
Frontend → Supabase Client → Supabase DB/Auth/Storage
```

### After (Google Cloud)
```
Frontend → NextAuth.js → Google Cloud PostgreSQL
         → Google OAuth → Database Sessions
         → Google Cloud Storage → Signed URLs
```

## 📅 3-Day Implementation Plan

### **Day 1: Infrastructure & Database Setup**
- [ x ] Set up Google Cloud Storage bucket
- [ ] Create Google OAuth credentials  
- [ ] Migrate database schema
- [ ] Set up NextAuth.js
- [ ] Create new database client

### **Day 2: Core Application Migration**
- [ ] Replace Supabase auth calls
- [ ] Update database operations
- [ ] Implement file upload/storage
- [ ] Update environment variables
- [ ] Test core functionality

### **Day 3: Testing & Optimization**
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Error handling
- [ ] Production deployment
- [ ] Cleanup and documentation

---

## 🛠️ Detailed Implementation

### Step 1: Google Cloud Storage Setup

#### 1.1 Create Storage Bucket
```bash
# Create bucket for file storage
gsutil mb gs://your-chatbot-ui-files

# Set bucket permissions
gsutil iam ch allUsers:objectViewer gs://your-chatbot-ui-files
```

#### 1.2 Generate Service Account Key
```bash
# Create service account
gcloud iam service-accounts create chatbot-ui-storage

# Grant storage permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:chatbot-ui-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Generate key
gcloud iam service-accounts keys create ./google-cloud-key.json \
  --iam-account=chatbot-ui-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Step 2: Google OAuth Setup

#### 2.1 Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### Step 3: Database Schema Migration

#### 3.1 Export Current Schema
```sql
-- Connect to your existing database and run this to understand current schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

#### 3.2 Create Migration Script
Create `migrate-schema.sql`:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Function to update modified column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now(); 
    RETURN NEW; 
END;
$$ language 'plpgsql';

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    bio TEXT NOT NULL CHECK (char_length(bio) <= 500),
    has_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT CHECK (char_length(image_url) <= 1000),
    image_path TEXT CHECK (char_length(image_path) <= 1000),
    profile_context TEXT CHECK (char_length(profile_context) <= 1500),
    display_name TEXT NOT NULL CHECK (char_length(display_name) <= 100),
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
    perplexity_api_key TEXT CHECK (char_length(perplexity_api_key) <= 1000)
);

-- NextAuth.js required tables
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE,
    email_verified TIMESTAMPTZ,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Continue with other tables (workspaces, chats, messages, etc.)
-- ... (I'll provide the complete schema in separate files)

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles (user_id);
CREATE INDEX idx_accounts_user_id ON accounts (user_id);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_token ON sessions (session_token);

-- Triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
```

### Step 4: Install Dependencies

```bash
# Remove Supabase dependencies (keep for now, remove later)
npm install next-auth @next-auth/prisma-adapter
npm install @google-cloud/storage
npm install pg @types/pg
npm install bcryptjs @types/bcryptjs
```

### Step 5: Environment Variables

#### 5.1 Update `.env.local`
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chatbot_ui"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="chatbot_ui"
DB_USER="your_username"
DB_PASSWORD="your_password"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="your-chatbot-ui-files"
GOOGLE_APPLICATION_CREDENTIALS="./google-cloud-key.json"

# Keep temporarily for gradual migration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key"
```

### Step 6: Database Client Setup

#### 6.1 Create `lib/database/client.ts`
```typescript
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
}

export default db
```

#### 6.2 Create `lib/auth/nextauth.ts`
```typescript
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { db } from '@/lib/database/client'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in our database
          const { rows } = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [user.email]
          )
          
          if (rows.length === 0) {
            // Create new user
            const { rows: newUser } = await db.query(
              'INSERT INTO users (name, email, image) VALUES ($1, $2, $3) RETURNING id',
              [user.name, user.email, user.image]
            )
            
            // Create default profile
            await db.query(
              `INSERT INTO profiles (user_id, display_name, username, bio, profile_context, use_azure_openai, has_onboarded) 
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                newUser[0].id,
                user.name,
                `user${newUser[0].id.slice(0, 8)}`,
                '',
                '',
                false,
                false
              ]
            )
          }
          
          return true
        } catch (error) {
          console.error('Error during sign in:', error)
          return false
        }
      }
      return true
    },
    
    async session({ session, token }) {
      if (session.user?.email) {
        const { rows } = await db.query(
          'SELECT id FROM users WHERE email = $1',
          [session.user.email]
        )
        if (rows.length > 0) {
          session.user.id = rows[0].id
        }
      }
      return session
    },
  },
  
  session: {
    strategy: 'database' as const,
  },
  
  adapter: {
    // Custom adapter for PostgreSQL
    // ... (I'll provide complete implementation)
  },
}

export default NextAuth(authOptions)
```

### Step 7: Update Database Operations

#### 7.1 Update `db/profile.ts`
```typescript
import { db } from '@/lib/database/client'

export const getProfileByUserId = async (userId: string) => {
  const { rows } = await db.query(
    'SELECT * FROM profiles WHERE user_id = $1',
    [userId]
  )
  
  if (rows.length === 0) {
    throw new Error('Profile not found')
  }
  
  return rows[0]
}

export const createProfile = async (profile: any) => {
  const { rows } = await db.query(
    `INSERT INTO profiles (user_id, display_name, username, bio, profile_context, use_azure_openai) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      profile.user_id,
      profile.display_name,
      profile.username,
      profile.bio,
      profile.profile_context,
      profile.use_azure_openai
    ]
  )
  
  return rows[0]
}

export const updateProfile = async (profileId: string, profile: any) => {
  const setClause = Object.keys(profile)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ')
  
  const values = [profileId, ...Object.values(profile)]
  
  const { rows } = await db.query(
    `UPDATE profiles SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1 RETURNING *`,
    values
  )
  
  return rows[0]
}
```

### Step 8: File Storage Implementation

#### 8.1 Create `lib/storage/google-cloud.ts`
```typescript
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET!)

export const uploadFile = async (file: Buffer, fileName: string, contentType: string) => {
  const fileUpload = bucket.file(fileName)
  
  await fileUpload.save(file, {
    metadata: {
      contentType,
    },
  })
  
  // Generate signed URL for access
  const [signedUrl] = await fileUpload.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  })
  
  return {
    fileName,
    url: signedUrl,
    size: file.length,
  }
}

export const deleteFile = async (fileName: string) => {
  await bucket.file(fileName).delete()
}

export const getSignedUrl = async (fileName: string) => {
  const [signedUrl] = await bucket.file(fileName).getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
  })
  
  return signedUrl
}
```

## 🧪 Testing Strategy

### Critical Test Cases
1. **Authentication**: Login/logout with Google OAuth
2. **Profile Management**: Create, read, update profile
3. **File Upload**: Upload and download files
4. **Chat Functionality**: Create chats, send messages
5. **Database Connections**: Connection pooling under load

### Testing Commands
```bash
# Run tests
npm test

# Test database connection
node -e "require('./lib/database/client').query('SELECT NOW()')"

# Test Google Cloud Storage
node -e "require('./lib/storage/google-cloud').uploadFile(Buffer.from('test'), 'test.txt', 'text/plain')"
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All environment variables configured
- [ ] Database schema migrated
- [ ] File uploads tested
- [ ] Authentication flow tested
- [ ] Core functionality verified

### Production Setup
- [ ] Configure production database connection
- [ ] Set up Google Cloud Storage production bucket
- [ ] Update OAuth redirect URLs
- [ ] Enable SSL/TLS
- [ ] Set up monitoring and logging

## 📊 Performance Considerations

### Database Optimization
- Connection pooling (configured)
- Proper indexing (included in schema)
- Query optimization (review slow queries)

### File Storage Optimization
- Signed URLs for secure access
- CDN integration (optional)
- File size limits

## 🔒 Security Considerations

### Database Security
- Database sessions (implemented)
- SQL injection prevention (parameterized queries)
- Connection encryption

### Authentication Security
- Google OAuth (trusted provider)
- Session management (NextAuth.js)
- CSRF protection (built-in)

## 📝 Migration Notes

### Data Migration
- Export existing data from Supabase
- Import to Google Cloud PostgreSQL
- Verify data integrity

### Rollback Plan
- Keep Supabase instance running during migration
- Document all changes
- Test rollback procedures

---

## 🎯 Success Metrics

### Day 1 Goals
- [ ] Infrastructure setup complete
- [ ] Database connection working
- [ ] Basic auth flow implemented

### Day 2 Goals
- [ ] Core CRUD operations working
- [ ] File upload/download functional
- [ ] User registration/login complete

### Day 3 Goals
- [ ] Full application testing passed
- [ ] Performance acceptable
- [ ] Ready for production deployment

---

**Next Steps**: Once you review this plan, I'll help you implement each step with detailed code examples and troubleshooting support. The tight timeline is achievable given your existing infrastructure! 