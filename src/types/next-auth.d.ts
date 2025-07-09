import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      isPremium: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    isPremium: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    isPremium: boolean
  }
}