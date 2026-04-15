import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calculateur Brut ↔ Net Israël",
  description:
    "Calculez votre salaire net israélien à partir du brut (tlush). Bituach Leumi, mas akhnasa, points de crédit, keren pension.",
}

export default function BrutNetLayout({ children }: { children: React.ReactNode }) {
  return children
}
