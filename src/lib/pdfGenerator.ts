import { jsPDF } from 'jspdf'

interface DocData {
  file_name: string
  document_type: string
  summary_fr: string
  analysis_data: Record<string, unknown>
  period?: string | null
  deadline?: string | null
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  payslip: 'Fiche de paie',
  bituah_leumi: 'Bituah Leumi',
  tax_notice: 'Avis fiscal',
  work_contract: 'Contrat de travail',
  pension: 'Pension / Retraite',
  health_insurance: 'Assurance sante',
  rental: 'Location',
  bank: 'Bancaire',
  official_letter: 'Courrier officiel',
  contract: 'Contrat',
  invoice: 'Facture',
  receipt: 'Recu',
  utility_bill: 'Facture service public',
  insurance: 'Assurance',
  other: 'Autre',
}

export function generateAnalysisPDF(doc: DocData): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ─── Header ───
  pdf.setFontSize(20)
  pdf.setTextColor(37, 99, 235) // brand-600
  pdf.text('Tloush', margin, y)
  pdf.setFontSize(10)
  pdf.setTextColor(148, 163, 184) // slate-400
  pdf.text('Rapport d\'analyse', margin + 30, y)
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  pdf.text(dateStr, pageWidth - margin, y, { align: 'right' })
  y += 4
  pdf.setDrawColor(226, 232, 240) // slate-200
  pdf.line(margin, y, pageWidth - margin, y)
  y += 10

  // ─── Document Info ───
  pdf.setFontSize(12)
  pdf.setTextColor(30, 41, 59) // slate-800
  pdf.text('Informations du document', margin, y)
  y += 7

  pdf.setFontSize(9)
  pdf.setTextColor(100, 116, 139) // slate-500
  const typeLabel = TYPE_LABELS[doc.document_type] || doc.document_type
  const infoLines = [
    `Type : ${typeLabel}`,
    `Fichier : ${doc.file_name}`,
    ...(doc.period ? [`Periode : ${doc.period}`] : []),
    ...(doc.deadline ? [`Echeance : ${doc.deadline}`] : []),
    `Analyse du : ${new Date(doc.created_at).toLocaleDateString('fr-FR')}`,
  ]
  for (const line of infoLines) {
    pdf.text(line, margin, y)
    y += 5
  }
  y += 5

  // ─── Summary ───
  pdf.setFontSize(12)
  pdf.setTextColor(30, 41, 59)
  pdf.text('Resume', margin, y)
  y += 7

  pdf.setFontSize(9)
  pdf.setTextColor(51, 65, 85) // slate-700
  const summaryLines = pdf.splitTextToSize(doc.summary_fr || 'Aucun resume disponible.', contentWidth)
  pdf.text(summaryLines, margin, y)
  y += summaryLines.length * 4.5 + 5

  // ─── Payslip Details ───
  const payslipDetails = doc.analysis_data?.payslip_details as Record<string, unknown> | undefined
  if (payslipDetails && doc.document_type === 'payslip') {
    y = checkPageBreak(pdf, y, 60)
    pdf.setFontSize(12)
    pdf.setTextColor(30, 41, 59)
    pdf.text('Details de la fiche de paie', margin, y)
    y += 7

    const payslipRows = [
      ['Salaire brut', formatAmount(payslipDetails.gross_salary)],
      ['Salaire net', formatAmount(payslipDetails.net_salary)],
      ['Impot sur le revenu', formatAmount(payslipDetails.income_tax)],
      ['Bituah Leumi', formatAmount(payslipDetails.bituah_leumi)],
      ['Assurance sante', formatAmount(payslipDetails.health_insurance)],
      ['Pension employe', formatAmount(payslipDetails.pension_employee)],
      ['Pension employeur', formatAmount(payslipDetails.pension_employer)],
      ['Heures travaillees', String(payslipDetails.hours_worked || '-')],
      ['Taux horaire', formatAmount(payslipDetails.base_hourly_rate)],
    ]

    pdf.setFontSize(9)
    for (const [label, value] of payslipRows) {
      pdf.setTextColor(100, 116, 139)
      pdf.text(label, margin, y)
      pdf.setTextColor(30, 41, 59)
      pdf.text(value, margin + 70, y)
      y += 5
    }
    y += 5

    // Payroll verification
    const verification = doc.analysis_data?.payroll_verification as Array<{ level: string; title: string; description: string }> | undefined
    if (verification && verification.length > 0) {
      y = checkPageBreak(pdf, y, 30)
      pdf.setFontSize(11)
      pdf.setTextColor(30, 41, 59)
      pdf.text('Verification automatique', margin, y)
      y += 6

      pdf.setFontSize(8)
      for (const check of verification) {
        y = checkPageBreak(pdf, y, 12)
        const marker = check.level === 'critical' ? '[!]' : check.level === 'warning' ? '[?]' : '[v]'
        const color = check.level === 'critical' ? [220, 38, 38] : check.level === 'warning' ? [217, 119, 6] : [22, 163, 74]
        pdf.setTextColor(color[0], color[1], color[2])
        pdf.text(`${marker} ${check.title}`, margin, y)
        y += 4
        pdf.setTextColor(100, 116, 139)
        const descLines = pdf.splitTextToSize(check.description, contentWidth - 5)
        pdf.text(descLines, margin + 3, y)
        y += descLines.length * 3.5 + 3
      }
      y += 3
    }
  }

  // ─── Attention Points ───
  const attentionPoints = doc.analysis_data?.attention_points as Array<{ level: string; title: string; description: string }> | undefined
  const points = attentionPoints || (doc.analysis_data?.attention_points as Array<{ level: string; title: string; description: string }> | undefined)
  if (points && points.length > 0) {
    y = checkPageBreak(pdf, y, 20)
    pdf.setFontSize(12)
    pdf.setTextColor(30, 41, 59)
    pdf.text('Points d\'attention', margin, y)
    y += 7

    pdf.setFontSize(8)
    for (const point of points) {
      y = checkPageBreak(pdf, y, 12)
      const color = point.level === 'critical' ? [220, 38, 38] : point.level === 'warning' ? [217, 119, 6] : point.level === 'info' ? [37, 99, 235] : [22, 163, 74]
      pdf.setTextColor(color[0], color[1], color[2])
      pdf.text(`[${point.level.toUpperCase()}] ${point.title}`, margin, y)
      y += 4
      pdf.setTextColor(100, 116, 139)
      const descLines = pdf.splitTextToSize(point.description, contentWidth - 5)
      pdf.text(descLines, margin + 3, y)
      y += descLines.length * 3.5 + 3
    }
    y += 3
  }

  // ─── Recommended Actions ───
  const actions = doc.analysis_data?.recommended_actions as Array<{ priority: string; action: string }> | undefined
  if (actions && actions.length > 0) {
    y = checkPageBreak(pdf, y, 20)
    pdf.setFontSize(12)
    pdf.setTextColor(30, 41, 59)
    pdf.text('Actions recommandees', margin, y)
    y += 7

    pdf.setFontSize(8)
    for (const action of actions) {
      y = checkPageBreak(pdf, y, 10)
      const priorityLabel = action.priority === 'immediate' ? 'URGENT' : action.priority === 'soon' ? 'PROCHAINEMENT' : 'QUAND POSSIBLE'
      pdf.setTextColor(action.priority === 'immediate' ? 220 : 100, action.priority === 'immediate' ? 38 : 116, action.priority === 'immediate' ? 38 : 139)
      pdf.text(`[${priorityLabel}]`, margin, y)
      pdf.setTextColor(51, 65, 85)
      const actionLines = pdf.splitTextToSize(action.action, contentWidth - 35)
      pdf.text(actionLines, margin + 33, y)
      y += actionLines.length * 3.5 + 4
    }
  }

  // ─── Footer ───
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    pdf.setFontSize(7)
    pdf.setTextColor(148, 163, 184)
    pdf.text(
      'Ce rapport est indicatif. Consultez un expert-comptable pour validation. — Tloush.com',
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
    pdf.text(`${i}/${pageCount}`, pageWidth - margin, pdf.internal.pageSize.getHeight() - 10, { align: 'right' })
  }

  return pdf
}

function checkPageBreak(pdf: jsPDF, y: number, needed: number): number {
  const pageHeight = pdf.internal.pageSize.getHeight()
  if (y + needed > pageHeight - 20) {
    pdf.addPage()
    return 20
  }
  return y
}

function formatAmount(value: unknown): string {
  if (value === null || value === undefined) return '-'
  const num = Number(value)
  if (isNaN(num)) return String(value)
  return `${num.toLocaleString('he-IL', { maximumFractionDigits: 0 })}₪`
}
