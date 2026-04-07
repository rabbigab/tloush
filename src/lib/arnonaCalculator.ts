/**
 * Arnona (Municipal Property Tax) Simulator
 *
 * Estimates arnona based on city, property size, and usage type.
 * Rates are approximate 2024-2025 ranges per sqm/month.
 *
 * Sources: skills-il/government-services, municipal rate publications
 */

export interface ArnonaInput {
  city: string
  propertySizeM2: number
  usage: 'residential' | 'office' | 'commercial'
  isOleh: boolean
  olehMonths?: number // months since aliyah
  isElderly: boolean
  isDisabled: boolean
  isSingleParent: boolean
  receivesIncomeSupplement: boolean
}

export interface ArnonaResult {
  city: string
  cityLabel: string
  bimonthlyAmount: number
  annualAmount: number
  monthlyEstimate: number
  ratePerM2: number
  propertySizeM2: number
  discounts: ArnonaDiscount[]
  discountedBimonthly: number
  discountedAnnual: number
  tips: string[]
}

export interface ArnonaDiscount {
  type: string
  label_fr: string
  percentage: number
  applied: boolean
  reason?: string
}

// Approximate arnona rates per sqm per month (residential)
// These are simplified averages — actual rates vary by zone within each city
export const ARNONA_CITIES: { id: string; label: string; rateResidential: number; rateOffice: number; rateCommercial: number }[] = [
  { id: 'tel_aviv', label: 'Tel Aviv', rateResidential: 32, rateOffice: 85, rateCommercial: 95 },
  { id: 'jerusalem', label: 'Jerusalem', rateResidential: 22, rateOffice: 55, rateCommercial: 65 },
  { id: 'haifa', label: 'Haifa', rateResidential: 18, rateOffice: 45, rateCommercial: 52 },
  { id: 'raanana', label: "Ra'anana", rateResidential: 28, rateOffice: 70, rateCommercial: 78 },
  { id: 'herzliya', label: 'Herzliya', rateResidential: 30, rateOffice: 80, rateCommercial: 90 },
  { id: 'netanya', label: 'Netanya', rateResidential: 20, rateOffice: 50, rateCommercial: 58 },
  { id: 'ashdod', label: 'Ashdod', rateResidential: 17, rateOffice: 42, rateCommercial: 48 },
  { id: 'beersheva', label: 'Beer Sheva', rateResidential: 14, rateOffice: 35, rateCommercial: 40 },
  { id: 'petah_tikva', label: 'Petah Tikva', rateResidential: 22, rateOffice: 55, rateCommercial: 62 },
  { id: 'rishon', label: 'Rishon LeZion', rateResidential: 23, rateOffice: 58, rateCommercial: 65 },
  { id: 'holon', label: 'Holon', rateResidential: 20, rateOffice: 50, rateCommercial: 56 },
  { id: 'rehovot', label: 'Rehovot', rateResidential: 21, rateOffice: 52, rateCommercial: 60 },
  { id: 'bat_yam', label: 'Bat Yam', rateResidential: 19, rateOffice: 48, rateCommercial: 54 },
  { id: 'ramat_gan', label: 'Ramat Gan', rateResidential: 26, rateOffice: 65, rateCommercial: 72 },
  { id: 'givatayim', label: 'Givatayim', rateResidential: 27, rateOffice: 68, rateCommercial: 75 },
  { id: 'modiin', label: "Modi'in", rateResidential: 24, rateOffice: 60, rateCommercial: 68 },
  { id: 'kfar_saba', label: 'Kfar Saba', rateResidential: 24, rateOffice: 60, rateCommercial: 67 },
  { id: 'hadera', label: 'Hadera', rateResidential: 16, rateOffice: 40, rateCommercial: 46 },
  { id: 'eilat', label: 'Eilat', rateResidential: 12, rateOffice: 30, rateCommercial: 35 },
  { id: 'nahariya', label: 'Nahariya', rateResidential: 15, rateOffice: 38, rateCommercial: 42 },
]

export function calculateArnona(input: ArnonaInput): ArnonaResult {
  const city = ARNONA_CITIES.find(c => c.id === input.city) || ARNONA_CITIES[0]
  const rate = input.usage === 'residential' ? city.rateResidential
    : input.usage === 'office' ? city.rateOffice
    : city.rateCommercial

  const monthlyBase = rate * input.propertySizeM2
  const bimonthlyBase = monthlyBase * 2
  const annualBase = monthlyBase * 12

  // Discounts
  const discounts: ArnonaDiscount[] = []

  // Oleh discount: up to 90% for first year, varies by city
  if (input.isOleh && input.olehMonths !== undefined && input.olehMonths <= 12) {
    discounts.push({
      type: 'oleh',
      label_fr: 'Reduction oleh hadash (1ere annee)',
      percentage: 90,
      applied: true,
      reason: 'Jusqu\'a 90% de reduction sur 100m2 la premiere annee (varie selon la ville)',
    })
  } else if (input.isOleh && input.olehMonths !== undefined && input.olehMonths <= 24) {
    discounts.push({
      type: 'oleh',
      label_fr: 'Reduction oleh hadash (2e annee)',
      percentage: 10,
      applied: true,
      reason: 'Reduction possible la 2e annee selon la municipalite',
    })
  }

  if (input.isElderly) {
    discounts.push({
      type: 'elderly',
      label_fr: 'Reduction 3e age',
      percentage: 25,
      applied: true,
      reason: 'Reduction pour les residents de plus de 62/67 ans sous conditions de revenus',
    })
  }

  if (input.isDisabled) {
    discounts.push({
      type: 'disabled',
      label_fr: 'Reduction invalidite',
      percentage: 80,
      applied: true,
      reason: 'Reduction significative pour les personnes en situation de handicap (sur 100m2)',
    })
  }

  if (input.isSingleParent) {
    discounts.push({
      type: 'single_parent',
      label_fr: 'Reduction parent isole',
      percentage: 20,
      applied: true,
      reason: 'Reduction pour les familles monoparentales sous conditions de revenus',
    })
  }

  if (input.receivesIncomeSupplement) {
    discounts.push({
      type: 'income_supplement',
      label_fr: 'Beneficiaire hashlamat hachnasa',
      percentage: 70,
      applied: true,
      reason: 'Reduction importante pour les beneficiaires du complement de revenu BL',
    })
  }

  // Take the best applicable discount (they don't stack in most cases)
  const bestDiscount = discounts.filter(d => d.applied).sort((a, b) => b.percentage - a.percentage)[0]
  const discountRate = bestDiscount ? bestDiscount.percentage / 100 : 0
  const discountedMonthly = monthlyBase * (1 - discountRate)
  const discountedBimonthly = discountedMonthly * 2
  const discountedAnnual = discountedMonthly * 12

  const tips: string[] = []
  tips.push('Les taux varient selon la zone et le quartier. Verifiez aupres de votre mairie (iriya).')
  tips.push('L\'arnona se paie par prelevement bimestriel (horaot keva) ou en paiement unique annuel (souvent avec une reduction de 1-2%).')
  if (input.usage === 'residential') {
    tips.push('Pour les logements de moins de 100m2, certaines villes appliquent un taux reduit.')
  }
  if (!input.isOleh) {
    tips.push('Si vous etes oleh hadash, n\'oubliez pas de demander votre reduction a la mairie dans les premiers mois.')
  }

  return {
    city: input.city,
    cityLabel: city.label,
    bimonthlyAmount: Math.round(bimonthlyBase),
    annualAmount: Math.round(annualBase),
    monthlyEstimate: Math.round(monthlyBase),
    ratePerM2: rate,
    propertySizeM2: input.propertySizeM2,
    discounts,
    discountedBimonthly: Math.round(discountedBimonthly),
    discountedAnnual: Math.round(discountedAnnual),
    tips,
  }
}
