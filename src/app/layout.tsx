import type { Metadata } from "next";
import { Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zoophiloo — Animaux & Plantes près de chez vous",
    template: "%s | Zoophiloo",
  },
  description:
    "La marketplace des passionnés : achetez, vendez, donnez ou échangez des animaux et des plantes près de chez vous.",
  keywords: ["animaux", "plantes", "vente", "don", "échange", "adoption", "marketplace"],
  openGraph: {
    type: "website",
    siteName: "Zoophiloo",
    title: "Zoophiloo — Animaux & Plantes",
    description: "La marketplace des passionnés près de chez vous",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} font-space bg-cream text-ink antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
