import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnLogin = req.nextUrl.pathname === '/login'

  // 1. Redirect unauthenticated users to login
  if (isOnDashboard) {
    if (isLoggedIn) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // 2. Redirect authenticated users away from login page
  if (isOnLogin) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

// Configure which routes the middleware applies to
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api/auth (NextAuth routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - icons (PWA icons)
   * - manifest.json (PWA manifest)
   */
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
}
