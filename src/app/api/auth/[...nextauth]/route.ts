import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Mark this route as dynamic since it uses headers/cookies
export const dynamic = 'force-dynamic'