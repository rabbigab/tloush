import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calculateur indemnités de licenciement (pitzuim) — Tloush",
  description:
    "Calculez vos indemnités de fin de contrat (pitzuim piturim) selon la loi israélienne. Formule, ancienneté, montant dû.",
}

export default function IndemnitesLayout({ children }: { children: React.ReactNode }) {
  return children
}
