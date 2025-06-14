import { NextAuthOptions } from 'next-auth'
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
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user exists in our database
          const { rows: existingUsers } = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [user.email]
          )
          
          if (existingUsers.length === 0) {
            // Create new user
            const { rows: newUsers } = await db.query(
              'INSERT INTO users (name, email, image) VALUES ($1, $2, $3) RETURNING id',
              [user.name, user.email, user.image]
            )
            
            const userId = newUsers[0].id
            
            // Generate unique username
            const username = `user${userId.toString().slice(0, 8)}`
            
            // Create default profile
            await db.query(
              `INSERT INTO profiles (user_id, display_name, username, bio, profile_context, use_azure_openai, has_onboarded) 
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [userId, user.name || 'User', username, '', '', false, false]
            )
            
            // Create default home workspace
            await db.query(
              `INSERT INTO workspaces (user_id, is_home, name, default_context_length, default_model, default_prompt, default_temperature, description, embeddings_provider, include_profile_context, include_workspace_instructions, instructions)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [
                userId, true, 'Home', 4096, 'gpt-4-1106-preview',
                'You are a friendly, helpful AI assistant.', 0.5,
                'My home workspace.', 'openai', true, true, ''
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
    
    async session({ session }) {
      if (session.user?.email) {
        const { rows } = await db.query(
          'SELECT id FROM users WHERE email = $1',
          [session.user.email]
        )
        if (rows.length > 0) {
          // @ts-ignore - Adding user id to session
          session.user.id = rows[0].id
        }
      }
      return session
    },
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  
  debug: process.env.NODE_ENV === 'development',
} 