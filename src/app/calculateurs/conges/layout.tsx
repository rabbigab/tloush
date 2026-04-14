import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calculateur de congés payés Israël — Tloush",
  description:
    "Calculez vos jours de congés annuels (chofesh) selon la loi israélienne. Par ancienneté, temps de travail, type de contrat.",
}

export default function CongesLayout({ children }: { children: React.ReactNode }) {
  return children
}
