import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AppProviders from "@/providers/AppProviders";

// Self-hosted at build time (no runtime request to Google) — satisfies the Workzone iframe CSP.
// For a fully hermetic/offline build, swap to next/font/local with committed .woff2 (see CLAUDE.md).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MINSUR Conecta — Gestión de Tiempos",
  description: "Gestión de tiempos de MINSUR sobre SAP Build Work Zone",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="font-[family-name:var(--font-sans)] antialiased bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
