import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { generateAnalysisPDF } from '@/lib/pdfGenerator'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) return auth
    const { user, supabase } = auth
    const { id } = await params

    const { data: doc } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!doc) {
      return NextResponse.json({ error: 'Document non trouve' }, { status: 404 })
    }

    const pdf = generateAnalysisPDF({
      file_name: doc.file_name,
      document_type: doc.document_type,
      summary_fr: doc.summary_fr || '',
      analysis_data: doc.analysis_data || {},
      period: doc.period,
      deadline: doc.deadline,
      created_at: doc.created_at,
    })

    const buffer = pdf.output('arraybuffer')
    const safeName = doc.file_name.replace(/[^a-zA-Z0-9._-]/g, '_')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tloush-rapport-${safeName}.pdf"`,
      },
    })
  } catch (err) {
    console.error('[PDF] Error:', err)
    return NextResponse.json({ error: 'Erreur generation PDF' }, { status: 500 })
  }
}
