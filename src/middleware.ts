import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes protégées (nécessitent un compte)
const PROTECTED_ROUTES = [
  '/inbox',
  '/assistant',
  '/profile',
  '/dashboard',
  '/compare',
  // '/documents' couvre /documents/[id] (detail prive). La page index
  // /documents/ a ete supprimee (Chantier 1 P0), seule la sous-route [id] reste.
  '/documents',
  '/folders',
  '/expenses',
  '/search',
  '/admin',
  // '/calculator' retire : la route redirige maintenant vers
  // /calculateurs/brut-net (public) cf. audit technical-mapping #17.
  // '/rights-check' et '/rights-detector' sont redirigees vers /aides
  // par next.config.js (308 permanent, Chantier 1 P1). Pas besoin d'entree
  // middleware dediee (la redirection est appliquee avant l'auth check).
  '/aides',
  '/referral',
  // '/help' retire : la page a ete supprimee, /aide (public) est desormais
  // la source unique du centre d'aide (Chantier 1 P0).
  '/letters',
  '/bituach-leumi',
  '/freelance',
  '/mashkanta',
  '/assurances',
  '/bank-import',
]

// Routes publiques qui n'ont pas besoin du middleware auth
const PUBLIC_ROUTES = ['/', '/auth', '/pricing', '/droits-olim', '/droits', '/privacy', '/calculateurs', '/modeles', '/scanner', '/experts', '/annuaire', '/contact', '/a-propos', '/faq', '/aide', '/api/stripe/webhook', '/api/annuaire/prestataires', '/api/annuaire/search', '/api/annuaire/inscription', '/api/annuaire/avis', '/api/track', '/api/experts/waitlist']

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
