import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { PosthogProvider } from "@/components/providers/PosthogProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tloush — Comprenez vos documents israéliens en français",
    template: "%s | Tloush",
  },
  description:
    "Uploadez vos documents administratifs israéliens en hébreu. Recevez une analyse complète en français en 30 secondes avec alertes et assistant IA.",
  keywords: ["documents israéliens", "fiche de paie", "israël", "tloush", "hébreu", "français", "analyse", "olim", "bituah leumi", "impôts israël"],
  metadataBase: new URL("https://tloush.com"),
  openGraph: {
    title: "Tloush — Comprenez vos documents israéliens en français",
    description: "Uploadez vos documents administratifs israéliens en hébreu et recevez une analyse complète en français en 30 secondes. 3 analyses offertes.",
    url: "https://tloush.com",
    siteName: "Tloush",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tloush — Comprenez vos documents israéliens en français",
    description: "Uploadez vos documents administratifs israéliens en hébreu et recevez une analyse complète en français en 30 secondes. 3 analyses offertes.",
    images: ["https://tloush.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tloush" />
      </head>
      <body>
        <ThemeProvider>
          <PosthogProvider>
            {children}
          </PosthogProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
