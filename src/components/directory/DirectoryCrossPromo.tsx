import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'

interface DirectoryCrossPromoProps {
  documentType?: string
  context?: 'devis' | 'facture' | 'general'
}

const TYPE_TO_CATEGORY: Record<string, { slug: string; label: string }> = {
  invoice: { slug: 'plombier', label: 'prestataire' },
  receipt: { slug: 'plombier', label: 'prestataire' },
  utility_bill: { slug: 'electricien', label: 'prestataire' },
}

export default function DirectoryCrossPromo({ documentType, context = 'general' }: DirectoryCrossPromoProps) {
  const mapped = documentType ? TYPE_TO_CATEGORY[documentType] : null

  const href = mapped ? `/annuaire/${mapped.slug}` : '/annuaire'

  const message = context === 'devis'
    ? 'Ce devis vous semble eleve ? Comparez avec nos prestataires francophones references.'
    : context === 'facture'
    ? 'Besoin d\'un autre prestataire ? Trouvez des professionnels francophones de confiance.'
    : 'Besoin d\'un professionnel francophone ? Plombier, electricien, peintre... trouvez le bon.'

  return (
    <div className="bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800 rounded-xl p-4 flex items-start gap-3">
      <Star size={18} className="text-brand-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-brand-700 dark:text-brand-300">{message}</p>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 mt-1.5"
        >
          Voir les prestataires recommandes <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
