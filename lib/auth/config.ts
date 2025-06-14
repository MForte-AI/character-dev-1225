import { NextAuthOptions } from 'next-auth'
import { Adapter } from 'next-auth/adapters'
import GoogleProvider from 'next-auth/providers/google'
import { db } from '@/lib/database/client'

export const authOptions: NextAuthOptions = {
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
            
            // Generate unique username
            const username = `user${newUser[0].id.toString().slice(0, 8)}`
            
            // Create default profile
            await db.query(
              `INSERT INTO profiles (user_id, display_name, username, bio, profile_context, use_azure_openai, has_onboarded) 
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                newUser[0].id,
                user.name || 'User',
                username,
                '',
                '',
                false,
                false
              ]
            )
            
            // Create default home workspace
            await db.query(
              `INSERT INTO workspaces (user_id, is_home, name, default_context_length, default_model, default_prompt, default_temperature, description, embeddings_provider, include_profile_context, include_workspace_instructions, instructions)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [
                newUser[0].id,
                true,
                'Home',
                4096,
                'gpt-4-1106-preview',
                'You are a friendly, helpful AI assistant.',
                0.5,
                'My home workspace.',
                'openai',
                true,
                true,
                ''
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
    
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  
  adapter: {
    async createUser({ name, email, image }) {
      const { rows } = await db.query(
        'INSERT INTO users (name, email, image) VALUES ($1, $2, $3) RETURNING *',
        [name, email, image]
      )
      return rows[0]
    },
    
    async getUser(id) {
      const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id])
      return rows[0] || null
    },
    
    async getUserByEmail(email) {
      const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email])
      return rows[0] || null
    },
    
    async getUserByAccount({ provider, providerAccountId }) {
      const { rows } = await db.query(
        'SELECT u.* FROM users u JOIN accounts a ON u.id = a.user_id WHERE a.provider = $1 AND a.provider_account_id = $2',
        [provider, providerAccountId]
      )
      return rows[0] || null
    },
    
    async updateUser({ id, ...user }) {
      const fields = Object.keys(user)
      const values = Object.values(user)
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
      
      const { rows } = await db.query(
        `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [id, ...values]
      )
      return rows[0]
    },
    
    async deleteUser(id) {
      await db.query('DELETE FROM users WHERE id = $1', [id])
    },
    
    async linkAccount(account) {
      await db.query(
        'INSERT INTO accounts (user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token,
          account.access_token,
          account.expires_at,
          account.token_type,
          account.scope,
          account.id_token,
          account.session_state,
        ]
      )
    },
    
    async unlinkAccount({ provider, providerAccountId }) {
      await db.query(
        'DELETE FROM accounts WHERE provider = $1 AND provider_account_id = $2',
        [provider, providerAccountId]
      )
    },
    
    async createSession({ sessionToken, userId, expires }) {
      const { rows } = await db.query(
        'INSERT INTO sessions (session_token, user_id, expires) VALUES ($1, $2, $3) RETURNING *',
        [sessionToken, userId, expires]
      )
      return rows[0]
    },
    
    async getSessionAndUser(sessionToken) {
      const { rows } = await db.query(
        'SELECT s.*, u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = $1',
        [sessionToken]
      )
      
      if (rows.length === 0) return null
      
      const { session_token, user_id, expires, ...user } = rows[0]
      return {
        session: { sessionToken: session_token, userId: user_id, expires },
        user,
      }
    },
    
    async updateSession({ sessionToken, ...session }) {
      const fields = Object.keys(session)
      const values = Object.values(session)
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
      
      const { rows } = await db.query(
        `UPDATE sessions SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE session_token = $1 RETURNING *`,
        [sessionToken, ...values]
      )
      return rows[0]
    },
    
    async deleteSession(sessionToken) {
      await db.query('DELETE FROM sessions WHERE session_token = $1', [sessionToken])
    },
    
    async createVerificationToken({ identifier, token, expires }) {
      await db.query(
        'INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1, $2, $3)',
        [identifier, token, expires]
      )
      return { identifier, token, expires }
    },
    
    async useVerificationToken({ identifier, token }) {
      const { rows } = await db.query(
        'DELETE FROM verification_tokens WHERE identifier = $1 AND token = $2 RETURNING *',
        [identifier, token]
      )
      return rows[0] || null
    },
  },
  
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  
  debug: process.env.NODE_ENV === 'development',
} 