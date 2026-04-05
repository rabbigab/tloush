import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { user, supabase } = auth

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  // Escape for ILIKE
  const pattern = `%${q.replace(/[%_]/g, '\\$&')}%`

  const { data: docs } = await supabase
    .from('documents')
    .select('id, file_name, document_type, period, summary_fr, is_urgent, action_required, created_at, folder_id')
    .eq('user_id', user.id)
    .or(`file_name.ilike.${pattern},summary_fr.ilike.${pattern},period.ilike.${pattern}`)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ results: docs || [] })
}
