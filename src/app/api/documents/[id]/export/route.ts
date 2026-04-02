import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Generates an HTML-based printable export of a document analysis.
 * Users can print to PDF from their browser (Ctrl+P / Cmd+P).
 * This avoids needing a heavy PDF library dependency.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id } = await params

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!doc) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
  }

  const analysisData = doc.analysis_data as Record<string, unknown> | null
  const keyInfo = analysisData?.key_info as Record<string, string> | undefined
  const fullAnalysis = (analysisData?.analysis_data as Record<string, string>)?.full_analysis
    || (analysisData as Record<string, string>)?.full_analysis
    || ''
  const analyzedDate = doc.analyzed_at
    ? new Date(doc.analyzed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Non disponible'

  const typeLabels: Record<string, string> = {
    payslip: 'Fiche de paie',
    official_letter: 'Courrier officiel',
    contract: 'Contrat',
    tax: 'Document fiscal',
    other: 'Autre document',
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Tloush — Analyse de ${doc.file_name}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none !important; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
    .date { font-size: 12px; color: #94a3b8; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
    .badge-urgent { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .badge-action { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .badge-ok { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 140px 1fr; gap: 8px 16px; }
    .info-label { font-size: 13px; color: #94a3b8; }
    .info-value { font-size: 14px; color: #1e293b; font-weight: 500; }
    .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .analysis { font-size: 14px; white-space: pre-wrap; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    .print-btn { position: fixed; bottom: 20px; right: 20px; background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
    .print-btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Imprimer / Sauvegarder en PDF</button>

  <div class="header">
    <div>
      <div class="logo">Tloush</div>
      <div style="font-size:12px;color:#64748b;margin-top:2px">Analyse de document</div>
    </div>
    <div class="date">Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
  </div>

  <div class="section">
    <div class="section-title">Informations</div>
    <div class="info-grid">
      <span class="info-label">Fichier</span>
      <span class="info-value">${doc.file_name}</span>
      <span class="info-label">Type</span>
      <span class="info-value">${typeLabels[doc.document_type] || doc.document_type}</span>
      <span class="info-label">Période</span>
      <span class="info-value">${doc.period || 'Non spécifiée'}</span>
      <span class="info-label">Analysé le</span>
      <span class="info-value">${analyzedDate}</span>
      <span class="info-label">Statut</span>
      <span class="info-value">${doc.is_urgent
        ? '<span class="badge badge-urgent">Urgent</span>'
        : doc.action_required
          ? '<span class="badge badge-action">Action requise</span>'
          : '<span class="badge badge-ok">OK</span>'
      }</span>
      ${keyInfo?.emitter ? `<span class="info-label">Émetteur</span><span class="info-value">${keyInfo.emitter}</span>` : ''}
      ${keyInfo?.amount ? `<span class="info-label">Montant</span><span class="info-value">${keyInfo.amount}</span>` : ''}
      ${keyInfo?.deadline ? `<span class="info-label">Date limite</span><span class="info-value" style="color:#dc2626;font-weight:700">${keyInfo.deadline}</span>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Résumé</div>
    <div class="summary-box">
      <p style="font-size:15px">${doc.summary_fr || 'Aucun résumé disponible'}</p>
      ${doc.action_description ? `<p style="margin-top:12px;font-size:14px;color:#d97706;font-weight:600">Action requise : ${doc.action_description}</p>` : ''}
    </div>
  </div>

  ${fullAnalysis ? `
  <div class="section">
    <div class="section-title">Analyse détaillée</div>
    <div class="analysis">${fullAnalysis}</div>
  </div>` : ''}

  <div class="footer">
    <p>Document généré par Tloush — tloush.vercel.app</p>
    <p style="margin-top:4px">Ce document est une analyse automatique et ne constitue pas un avis juridique ou comptable.</p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
