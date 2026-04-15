'use client'

import { useState } from 'react'
import { Shield, Calendar, Heart, Wallet, Clock, Baby, Calculator, ChevronDown, ChevronUp, Scale, Briefcase } from 'lucide-react'
import { calculateEmployeeRights, type EmployeeProfile, type RightsResult } from '@/lib/employeeRights'

const STATUS_COLORS = {
  ok: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  warning: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
}

export default function RightsCheckClient() {
  const [seniorityYears, setSeniorityYears] = useState('1')
  const [seniorityMonths, setSeniorityMonths] = useState('0')
  const [workDays, setWorkDays] = useState<'5' | '6'>('5')
  const [hoursPerDay, setHoursPerDay] = useState('9')
  const [salary, setSalary] = useState('')
  const [employmentType, setEmploymentType] = useState<'full_time' | 'part_time' | 'hourly'>('full_time')
  const [isWoman, setIsWoman] = useState(false)
  const [isNewOleh, setIsNewOleh] = useState(false)
  const [aliyahYear, setAliyahYear] = useState(String(new Date().getFullYear()))
  const [hasChildren, setHasChildren] = useState(false)
  const [numChildren, setNumChildren] = useState('0')
  const [isSingleParent, setIsSingleParent] = useState(false)
  const [hasPension, setHasPension] = useState(true)
  const [hasKeren, setHasKeren] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [result, setResult] = useState<RightsResult | null>(null)

  function calculate() {
    if (!salary || Number(salary) <= 0) return
    const profile: EmployeeProfile = {
      seniorityYears: Number(seniorityYears),
      seniorityMonths: Number(seniorityMonths),
      workDaysPerWeek: Number(workDays) as 5 | 6,
      hoursPerDay: Number(hoursPerDay),
      monthlySalary: Number(salary),
      employmentType,
      isWoman,
      isNewOleh,
      aliyahYear: isNewOleh ? Number(aliyahYear) : undefined,
      hasChildren,
      numberOfChildren: hasChildren ? Number(numChildren) : undefined,
      isSingleParent,
      hasPension,
      hasKerenHishtalmut: hasKeren,
    }
    setResult(calculateEmployeeRights(profile))
  }

  const fmt = (n: number) => n.toLocaleString('he-IL', { maximumFractionDigits: 0 })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center">
            <Shield size={22} className="text-indigo-600" />
          </div>
          Droits du salarie (calcul manuel)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Calculez vos droits du travail israeliens a partir de votre profil : conges, maladie, pension, preavis, pitzuim, heures sup. Pour un scan automatique des aides gouvernementales (olim, seniors, familles), utilisez plutot &laquo; Detecter mes aides &raquo;.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Salaire brut mensuel</label>
            <div className="relative">
              <input type="number" value={salary} onChange={e => setSalary(e.target.value)} onKeyDown={e => e.key === 'Enter' && calculate()} placeholder="Ex: 10000" className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-lg font-semibold focus:ring-2 focus:ring-brand-400 focus:outline-none" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">₪</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Type d&apos;emploi</label>
            <select value={employmentType} onChange={e => setEmploymentType(e.target.value as 'full_time' | 'part_time' | 'hourly')} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              <option value="full_time">Temps plein</option>
              <option value="part_time">Temps partiel</option>
              <option value="hourly">Horaire</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Anciennete (annees)</label>
            <input type="number" min="0" max="50" value={seniorityYears} onChange={e => setSeniorityYears(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">+ mois</label>
            <input type="number" min="0" max="11" value={seniorityMonths} onChange={e => setSeniorityMonths(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Jours/semaine</label>
            <select value={workDays} onChange={e => setWorkDays(e.target.value as '5' | '6')} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100">
              <option value="5">5 jours</option>
              <option value="6">6 jours</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={isWoman} onChange={e => setIsWoman(e.target.checked)} className="rounded" /> Femme
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={isNewOleh} onChange={e => setIsNewOleh(e.target.checked)} className="rounded" /> Nouvel oleh
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={hasPension} onChange={e => setHasPension(e.target.checked)} className="rounded" /> Pension active
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={hasKeren} onChange={e => setHasKeren(e.target.checked)} className="rounded" /> Keren Hishtalmut
          </label>
        </div>

        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors">
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Plus d&apos;options
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-4 pt-1">
            {isNewOleh && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Annee d&apos;aliyah</label>
                <input type="number" value={aliyahYear} onChange={e => setAliyahYear(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Heures/jour</label>
              <input type="number" value={hoursPerDay} onChange={e => setHoursPerDay(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 pt-5">
              <input type="checkbox" checked={hasChildren} onChange={e => setHasChildren(e.target.checked)} className="rounded" /> Enfants a charge
            </label>
            {hasChildren && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nombre d&apos;enfants</label>
                <input type="number" min="1" max="15" value={numChildren} onChange={e => setNumChildren(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100" />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={isSingleParent} onChange={e => setIsSingleParent(e.target.checked)} className="rounded" /> Parent isole
            </label>
          </div>
        )}

        <button onClick={calculate} disabled={!salary} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors active:scale-[0.99]">
          Calculer mes droits
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slideUp">
          {/* Summary */}
          <div className="space-y-2">
            {result.summary.map((item, i) => (
              <div key={i} className={`rounded-xl border px-4 py-3 ${STATUS_COLORS[item.status]}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium opacity-70">{item.category}</span>
                    <p className="font-semibold text-sm">{item.title}</p>
                  </div>
                  <span className="text-sm font-bold whitespace-nowrap">{item.value}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Detailed cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Calendar} title="Conges payes" color="blue" items={[
              { label: 'Jours/an (ajuste)', value: `${result.vacation.adjustedForWorkWeek} jours` },
              { label: 'Valeur journaliere', value: `${fmt(result.vacation.dailyRate)}₪` },
              { label: 'Valeur annuelle', value: `${fmt(result.vacation.annualValue)}₪` },
            ]} law={result.vacation.law} />

            <DetailCard icon={Heart} title="Jours de maladie" color="rose" items={[
              { label: 'Cumul estime', value: `${result.sickLeave.currentEstimate} jours` },
              { label: 'Accumulat./mois', value: `${result.sickLeave.monthlyAccrual} jour` },
              { label: 'Maximum', value: `${result.sickLeave.maxAccumulated} jours` },
            ]} law={result.sickLeave.law} extra={
              <div className="mt-2 text-xs space-y-0.5">
                {result.sickLeave.payRules.map((r, i) => <div key={i} className="text-slate-500 dark:text-slate-400">{r.day}: {r.rate}</div>)}
              </div>
            } />

            <DetailCard icon={Briefcase} title="Dmei Havra'a" color="amber" items={[
              { label: 'Jours/an', value: `${result.convalescence.days} jours` },
              { label: 'Taux journalier', value: `${result.convalescence.dailyRate}₪` },
              { label: 'Total annuel', value: `${fmt(result.convalescence.annualAmount)}₪` },
            ]} law={result.convalescence.law} />

            <DetailCard icon={Wallet} title="Pension" color="emerald" items={[
              { label: 'Employe', value: `${(result.pension.employeeRate * 100)}% = ${fmt(result.pension.monthlyEmployeeAmount)}₪/mois` },
              { label: 'Employeur', value: `${(result.pension.employerRate * 100)}% = ${fmt(result.pension.monthlyEmployerAmount)}₪/mois` },
              { label: 'Pitzouim', value: `${(result.pension.severanceRate * 100)}% = ${fmt(result.pension.monthlySeveranceAmount)}₪/mois` },
              { label: 'Total', value: `${fmt(result.pension.totalMonthly)}₪/mois` },
            ]} law={result.pension.law} />

            <DetailCard icon={Scale} title="Pitzouim (licenciement)" color="violet" items={[
              { label: 'Eligible', value: result.severance.isEligible ? 'Oui (1+ an)' : 'Pas encore' },
              { label: 'Estimation', value: `${fmt(result.severance.estimatedAmount)}₪` },
              { label: 'Exonere impot', value: `${fmt(result.severance.taxExempt)}₪` },
              { label: 'Formule', value: result.severance.formula },
            ]} law={result.severance.law} />

            <DetailCard icon={Clock} title="Preavis" color="slate" items={[
              { label: 'Employe', value: `${result.notice.employeeDays} jours` },
              { label: 'Employeur', value: `${result.notice.employerDays} jours` },
            ]} law={result.notice.law} />

            <DetailCard icon={Baby} title="Maternite / Paternite" color="pink" items={[
              { label: 'Conge total', value: `${result.maternity.totalWeeks} semaines` },
              { label: 'Semaines payees', value: `${result.maternity.paidWeeks} (par ${result.maternity.paidBy})` },
              { label: 'Protection emploi', value: `${result.maternity.jobProtectionDays} jours apres retour` },
              { label: 'Paternite', value: `${result.maternity.paternityDays} jours` },
            ]} law={result.maternity.law} />

            <DetailCard icon={Calculator} title="Points de credit fiscal" color="brand" items={[
              { label: 'Total points', value: `${result.creditPoints.totalPoints}` },
              { label: 'Valeur/mois', value: `${fmt(result.creditPoints.monthlyValue)}₪` },
              { label: 'Valeur/an', value: `${fmt(result.creditPoints.annualValue)}₪` },
            ]} law="פקודת מס הכנסה" extra={
              <div className="mt-2 text-xs space-y-0.5">
                {result.creditPoints.details.map((d, i) => <div key={i} className="text-slate-500 dark:text-slate-400">{d}</div>)}
              </div>
            } />
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Calcul base sur le droit du travail israelien 2026. Consultez un expert pour validation.
          </p>
        </div>
      )}
    </div>
  )
}

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400',
  slate: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  pink: 'bg-pink-100 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400',
  brand: 'bg-brand-100 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400',
}

function DetailCard({ icon: Icon, title, color, items, law, extra }: {
  icon: React.ElementType
  title: string
  color: string
  items: { label: string; value: string }[]
  law: string
  extra?: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${COLOR_MAP[color] || COLOR_MAP.slate}`}>
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.value}</span>
          </div>
        ))}
      </div>
      {extra}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono" dir="rtl">{law}</p>
      </div>
    </div>
  )
}
