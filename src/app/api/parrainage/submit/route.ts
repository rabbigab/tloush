import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_CODES = 200

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 })
    }

    const body = await req.json()
    const postUrl = typeof body.post_url === 'string' ? body.post_url.trim() : ''

    if (!postUrl || !postUrl.startsWith('http')) {
      return NextResponse.json({ error: 'URL du post invalide.' }, { status: 400 })
    }

    // Check si l'utilisateur a deja soumis (contrainte unique user_id)
    const { data: existing } = await supabase
      .from('social_shares')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Vous avez deja soumis un partage. Un seul code par utilisateur.' },
        { status: 409 }
      )
    }

    // Check cap global (200 codes max)
    const { count } = await supabase
      .from('social_shares')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')

    if (count != null && count >= MAX_CODES) {
      return NextResponse.json(
        { error: `L'offre est terminee : les ${MAX_CODES} codes ont ete distribues.` },
        { status: 410 }
      )
    }

    // Inserer en status=pending
    const { error: insertError } = await supabase
      .from('social_shares')
      .insert({
        user_id: user.id,
        post_url: postUrl,
        group_name: extractGroupName(postUrl),
        status: 'pending',
      })

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Vous avez deja soumis un partage.' },
          { status: 409 }
        )
      }
      console.error('[parrainage/submit] insert error:', insertError)
      return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Demande envoyee. Validation sous 48h.' })
  } catch (err) {
    console.error('[parrainage/submit]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

function extractGroupName(url: string): string | null {
  try {
    const match = url.match(/facebook\.com\/groups\/([^/?#]+)/)
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}
