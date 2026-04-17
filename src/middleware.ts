import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes protégées (nécessitent un compte)
// Note : tous les slugs ont ete francises (P2). Les anciens chemins
// /folders, /search, /referral, /assistant, /bank-import, /compare, /inbox
// sont rediriges 308 par next.config.js — pas besoin d'entree middleware.
const PROTECTED_ROUTES = [
  '/assistant-ia',
  '/profile',
  '/dashboard',
  '/comparer-fiches',
  // '/documents' couvre /documents/[id] (detail prive). La page index
  // /documents/ a ete supprimee (Chantier 1 P0), seule la sous-route [id] reste.
  '/documents',
  '/mes-documents',
  '/expenses',
  '/recherche',
  '/admin',
  '/aides',
  // '/parrainage' retire de PROTECTED (page publique FB share).
  // L'API /api/parrainage/submit verifie l'auth elle-meme.
  '/letters',
  '/freelance',
  '/mashkanta',
  '/assurances',
  '/import-bancaire',
]

// Routes publiques qui n'ont pas besoin du middleware auth.
// Note: '/droits' couvre /droits/guides + /droits/[slug]. Le questionnaire
// olim a ete deplace dans /aides/olim (zone auth) lors de la consolidation
// /aides — cf. memory/audit_interface.md.
// Note: '/annuaire' couvre aussi /annuaire/artisans, /annuaire/professionnels
// via startsWith(). Ancienne route '/experts' redirigee 308 vers
// /annuaire/professionnels par next.config.js (Chantier 1 P1 PR #2C).
const PUBLIC_ROUTES = ['/', '/auth', '/pricing', '/droits', '/privacy', '/calculateurs', '/modeles', '/scanner', '/annuaire', '/parrainage', '/contact', '/a-propos', '/faq', '/aide', '/api/stripe/webhook', '/api/annuaire/prestataires', '/api/annuaire/search', '/api/annuaire/inscription', '/api/annuaire/avis', '/api/track', '/api/experts/waitlist', '/api/parrainage']

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
