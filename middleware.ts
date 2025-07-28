// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Ejemplo: revisamos si hay cookie de sesión "sb-access-token" de Supabase
  const token = req.cookies.get('sb-access-token')

  const url = req.nextUrl.clone()

  if (!token && url.pathname.startsWith('/admin')) {
    // Si no hay token y accede a /admin, redirige a login
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
