'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, FileText, Heart, Briefcase, Home, Calculator, Shield, HelpCircle, MessageSquare } from 'lucide-react'

const GUIDES = [
  {
    id: 'payslip',
    icon: Briefcase,
    title: 'Ma première fiche de paie en Israël',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    content: `**Comment lire votre תלוש משכורת (tloush maskoret)**

Votre fiche de paie israélienne contient plusieurs sections importantes :

**1. En-tête** — Vos informations personnelles
- שם עובד = Votre nom
- ת.ז = Numéro d'identité (Teudat Zehut)
- תחילת עבודה = Date de début d'emploi

**2. Paiements (תשלומים)**
- שכר יסוד = Salaire de base
- נסיעות = Indemnité de transport
- שעות נוספות = Heures supplémentaires (125% et 150%)
- הבראה = Prime de convalescence (après 1 an)

**3. Retenues (ניכויים)**
- מס הכנסה = Impôt sur le revenu
- ביטוח לאומי = Bituah Leumi (sécurité sociale)
- דמי בריאות = Assurance santé
- קרן פנסיה = Caisse de retraite

**Que vérifier ?**
- Votre taux horaire doit être ≥ 32.30₪ (salaire minimum 2025)
- Les heures sup doivent être payées 125% (2 premières) puis 150%
- La cotisation retraite est obligatoire après 6 mois d'ancienneté
- Vérifiez que vos congés (חופשה) et maladie (מחלה) s'accumulent

**Astuce Tloush** : Uploadez votre fiche de paie et notre IA vérifie automatiquement tous ces points.`,
  },
  {
    id: 'bituah-leumi',
    icon: Shield,
    title: 'Comprendre le Bituah Leumi',
    color: 'text-green-600 bg-green-50 dark:bg-green-950/30',
    content: `**Le ביטוח לאומי (Bituah Leumi) — Sécurité sociale israélienne**

Le Bituah Leumi est l'équivalent de la Sécurité sociale française. Tout résident en Israël y cotise.

**Vos droits principaux :**
- **Allocations familiales** (קצבת ילדים) : par enfant, automatique
- **Allocations chômage** (דמי אבטלה) : après 12 mois de cotisation
- **Allocations maternité** (דמי לידה) : 15 semaines de congé payé
- **Allocations invalidité** (קצבת נכות) : si incapacité de travail

**Cotisations :**
- Salarié : ~3.5% jusqu'à 7 122₪, puis ~12% au-delà
- Indépendant : ~6.72% jusqu'au premier seuil, ~17.83% au-delà

**Documents courants :**
- אישור זכאות = Confirmation de droits
- תביעה = Demande d'allocation
- שומה = Avis de cotisation
- ערעור = Appel/Contestation

**Important :** Si vous recevez un courrier avec une date limite (מועד אחרון), ne l'ignorez pas ! Uploadez-le sur Tloush pour comprendre exactement ce qu'on vous demande.`,
  },
  {
    id: 'work-contract',
    icon: FileText,
    title: 'Vérifier mon contrat de travail',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
    content: `**Les points clés d'un חוזה עבודה (contrat de travail) israélien**

En Israël, l'employeur doit fournir un contrat écrit dans les 30 jours suivant l'embauche.

**Ce que doit contenir votre contrat :**
- שם המעסיק = Nom de l'employeur
- תפקיד = Poste/fonction
- שכר = Salaire (≥ 5 880₪/mois minimum)
- שעות עבודה = Heures de travail (max 42h/semaine standard)
- חופשה שנתית = Congés annuels (minimum 12 jours la 1ère année)
- תקופת ניסיון = Période d'essai (généralement 3-6 mois)
- הודעה מוקדמת = Préavis (1 jour/mois la 1ère année, puis 2.5 jours/mois)

**Clauses à surveiller :**
- Clause de non-concurrence (אי תחרות) : souvent non applicable en Israël
- Heures supplémentaires forfaitaires (שעות נוספות גלובליות) : vérifier le calcul
- Frais de transport : l'employeur doit rembourser selon la distance réelle

**Droits en cas de licenciement :**
- Après 1 an : droit aux indemnités de licenciement (פיצויי פיטורים)
- Calcul : 1 mois de salaire par année d'ancienneté
- Préavis obligatoire

**Astuce Tloush** : Uploadez votre contrat avant de signer et notre IA identifie les clauses problématiques.`,
  },
  {
    id: 'olim',
    icon: Heart,
    title: 'Droits des olim hadashim',
    color: 'text-red-600 bg-red-50 dark:bg-red-950/30',
    content: `**Vos droits en tant qu'olé hadash (nouvel immigrant)**

L'alya donne droit à de nombreux avantages fiscaux et sociaux.

**Avantages fiscaux :**
- **3.5 points de crédit fiscal** supplémentaires pendant 3.5 ans
- Valeur d'un point : ~235₪/mois → économie jusqu'à ~822₪/mois d'impôts
- Exonération d'impôt sur les revenus étrangers pendant 10 ans

**Aides du Misrad HaKlita :**
- **Sal Klita** (סל קליטה) : panier d'intégration, ~25 000₪ sur 6 mois (personne seule)
- **Aide au loyer** (סיוע בשכר דירה) : selon zone géographique, jusqu'à 5 ans
- **Cours d'hébreu** (אולפן) : gratuit les 18 premiers mois

**Bituah Leumi :**
- Couverture santé dès le jour d'arrivée
- Choix de la Kupat Holim (caisse maladie) : Clalit, Maccabi, Meuhedet ou Leumit

**Emploi :**
- Programmes d'aide à l'emploi via le Misrad HaKlita
- Reconnaissance des diplômes : procédure spécifique selon le domaine
- Droit au salaire minimum dès le premier jour

**Documents importants à conserver :**
- Teudat Olé (תעודת עולה)
- Teudat Zehut (תעודת זהות)
- Formulaire 101 (טופס 101) : à remplir chez chaque employeur
- Avis du Bituah Leumi

**Astuce Tloush** : Tous ces documents sont en hébreu. Uploadez-les et nous vous les expliquons en français !`,
  },
  {
    id: 'taxes',
    icon: Calculator,
    title: 'Comprendre les impôts en Israël',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
    content: `**Le système fiscal israélien pour les francophones**

**Impôt sur le revenu (מס הכנסה) :**
Barème progressif 2025 :
- Jusqu'à 7 010₪ : 10%
- 7 011 - 10 060₪ : 14%
- 10 061 - 16 150₪ : 20%
- 16 151 - 22 440₪ : 31%
- 22 441 - 46 690₪ : 35%
- Au-delà de 46 690₪ : 47%
- Au-delà de ~698 280₪/an : 50%

**Points de crédit fiscal (נקודות זיכוי) :**
- Résident : 2.25 points
- Femme : +0.5 point
- Olé hadash : +3.5 points (3.5 ans)
- Enfants : points supplémentaires
- Valeur d'un point : ~235₪/mois

**Formulaire 106 :**
- Reçu de votre employeur en mars/avril pour l'année précédente
- Résumé annuel de vos salaires et retenues
- Nécessaire pour la déclaration annuelle ou demande de remboursement

**Remboursement d'impôt (החזר מס) :**
Si vous pensez avoir trop payé d'impôts (points de crédit non appliqués, revenus irréguliers...), vous pouvez demander un remboursement jusqu'à 6 ans en arrière.

**Astuce Tloush** : Uploadez votre formulaire 106 ou avis d'imposition, nous vérifions si un remboursement est possible.`,
  },
  {
    id: 'rental',
    icon: Home,
    title: 'Mon contrat de location',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30',
    content: `**Comprendre un contrat de bail israélien (חוזה שכירות)**

**Points clés à vérifier :**
- Durée du bail (תקופת שכירות) et conditions de renouvellement
- Montant du loyer (שכר דירה) et date de paiement
- Dépôt de garantie : généralement 1-3 mois (en chèques ou virement)
- Qui paye la vaad bayit (ועד בית) = charges de copropriété
- Qui paye l'arnona (ארנונה) = taxe foncière municipale
- État des lieux (פרוטוקול) : à faire et signer

**Charges à votre charge :**
- Arnona : taxe municipale, varie selon la ville et la surface
- Eau (מים) : via la copropriété ou directement
- Électricité (חשמל) : contrat direct avec חברת חשמל
- Gaz : selon l'installation
- Vaad bayit : charges communes de l'immeuble

**Aide au loyer pour olim :**
- Demande au Misrad HaKlita
- Montant selon zone géographique et composition familiale
- Durée : jusqu'à 5 ans après l'alya

**En cas de litige :**
Contactez un avocat spécialisé. Tloush peut vous recommander un expert francophone depuis notre annuaire.`,
  },
]

const FAQ = [
  {
    q: 'Comment analyser un document ?',
    a: 'Allez dans l\'Inbox, cliquez sur la zone d\'upload et sélectionnez votre document (PDF, JPG ou PNG). L\'analyse prend environ 10-15 secondes.',
  },
  {
    q: 'Mes documents sont-ils en sécurité ?',
    a: 'Oui. Vos documents sont stockés de manière chiffrée sur Supabase (infrastructure européenne). Seul vous y avez accès. Nous ne partageons jamais vos données.',
  },
  {
    q: 'Combien d\'analyses gratuites ai-je ?',
    a: 'Le plan Découverte offre 3 analyses gratuites au total, plus les analyses bonus obtenues par parrainage. Pour analyser plus de documents, passez au plan Solo (49₪/mois).',
  },
  {
    q: 'L\'assistant IA peut-il m\'aider ?',
    a: 'Oui ! L\'assistant comprend l\'administration israélienne et peut répondre à vos questions sur vos documents, traduire des courriers hébreux, et vous guider dans vos démarches. Plan gratuit : 5 messages/mois.',
  },
  {
    q: 'Comment fonctionne le parrainage ?',
    a: 'Partagez votre lien de parrainage (page Parrainage). Pour chaque ami inscrit, vous recevez +1 analyse gratuite. Si votre filleul passe en plan payant, vous recevez 1 mois Solo offert.',
  },
  {
    q: 'Puis-je supprimer mon compte ?',
    a: 'Oui, depuis votre Profil. La suppression est immédiate et irréversible : tous vos documents et données sont effacés.',
  },
]

export default function HelpClient() {
  const [openGuide, setOpenGuide] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={32} className="text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Centre d&apos;aide</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Guides pratiques pour comprendre vos documents israéliens en français.
        </p>
      </div>

      {/* Guides */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Guides pratiques</h2>
        <div className="space-y-3">
          {GUIDES.map(guide => {
            const Icon = guide.icon
            const isOpen = openGuide === guide.id
            return (
              <div key={guide.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  onClick={() => setOpenGuide(isOpen ? null : guide.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${guide.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="flex-1 font-semibold text-sm text-slate-800 dark:text-slate-200">{guide.title}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700">
                    <div className="pt-4 prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-line text-sm leading-relaxed">
                      {guide.content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-bold text-slate-900 dark:text-slate-100 mt-4 mb-1">{line.replace(/\*\*/g, '')}</p>
                        }
                        if (line.startsWith('- ')) {
                          return <p key={i} className="ml-4 text-sm">{line}</p>
                        }
                        return <p key={i} className="text-sm">{line}</p>
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Questions fréquentes</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => {
            const isOpen = openFaq === i
            return (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                  <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">{item.q}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand-50 dark:bg-brand-950/30 rounded-2xl border border-brand-200 dark:border-brand-800 p-6 text-center">
        <MessageSquare size={24} className="text-brand-600 mx-auto mb-3" />
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Vous ne trouvez pas la réponse ?</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Notre assistant IA peut répondre à toutes vos questions sur l&apos;administration israélienne.</p>
        <Link
          href="/assistant"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <MessageSquare size={14} />
          Poser une question
        </Link>
      </div>
    </div>
  )
}
