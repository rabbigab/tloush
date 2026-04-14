import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Droits des olim hadashim — Tloush",
  description:
    "Tous les droits et aides pour les olim hadashim en Israël : sal klita, ulpan, assurance santé, logement, emploi, Misrad HaKlita.",
}

export default function DroitsOlimLayout({ children }: { children: React.ReactNode }) {
  return children
}
