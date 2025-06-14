import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/simple-config'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 