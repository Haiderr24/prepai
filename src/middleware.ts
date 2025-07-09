import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/boards/:path*',
    '/api/lists/:path*', 
    '/api/cards/:path*',
  ],
}