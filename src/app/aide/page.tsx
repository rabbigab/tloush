import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * /aide — alias francophone de /help pour la coherence linguistique
 * (audit #29). Comme le site est 100 % francophone, il doit repondre
 * a l'URL `/aide` aussi bien qu'a `/help`.
 *
 * /help est dans la zone authentifiee (auth-gated). Les utilisateurs
 * non connectes qui atteignent /aide seront rediriges vers /help et
 * le middleware d'auth les renverra ensuite vers /auth/login si
 * necessaire.
 */
export default function AidePage() {
  redirect('/help')
}
