import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes protégées (nécessitent un compte)
const PROTECTED_ROUTES = [
  '/inbox',
  '/assistant',
  '/profile',
  '/dashboard',
  '/compare',
  '/documents',
  '/folders',
  '/expenses',
  '/search',
  '/admin',
  '/calculator',
  '/rights-check',
  '/referral',
  '/help',
  '/letters',
  '/bituach-leumi',
  '/freelance',
  '/arnona',
  '/mashkanta',
]

// Routes publiques qui n'ont pas besoin du middleware auth
const PUBLIC_ROUTES = ['/', '/auth', '/pricing', '/droits-olim', '/droits', '/privacy', '/calculateurs', '/modeles', '/scanner', '/results', '/experts', '/api/stripe/webhook']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth check for public routes — saves ~200-500ms per request
  const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  // For public non-protected routes, skip Supabase entirely
  if (isPublic && !isProtected) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
