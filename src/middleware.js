import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // --- Protect /dashboard — requires any logged-in staff ---
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    // Staff role can only access /dashboard, not /admin
    const allowedRoles = ['owner', 'manager', 'staff']
    if (!allowedRoles.includes(token.role)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // --- Protect /admin — superadmin only ---
  if (pathname.startsWith('/admin')) {
    if (!token || token.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // --- Redirect logged-in users away from /login ---
  if (pathname === '/login' && token) {
    if (token.role === 'superadmin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run middleware on these routes only
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
}