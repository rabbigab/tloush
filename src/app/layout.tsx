import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tloush — Analysez votre fiche de paie israélienne",
  description:
    "Comprenez enfin votre fiche de paie israélienne en français. Détectez les anomalies, vérifiez vos droits et préparez vos questions.",
  keywords: ["fiche de paie", "israël", "tloush", "salaire", "hébreu", "français", "analyse"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
