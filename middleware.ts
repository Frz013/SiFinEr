import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow auth routes and API routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/cron')) {
    return NextResponse.next()
  }

  // Allow login page
  if (pathname === '/login') {
    if (req.auth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Protected routes: redirect to login if not authenticated
  if (!req.auth) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
