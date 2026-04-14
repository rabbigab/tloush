import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calculateur congé maternité (chofesh leida) — Tloush",
  description:
    "Calculez votre allocation maternité israélienne : durée du congé, montant des paiements Bituach Leumi, dates clés.",
}

export default function MaterniteLayout({ children }: { children: React.ReactNode }) {
  return children
}
