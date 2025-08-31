import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const locales = ['en', 'ta'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "SafeGuard Navigator - Your Trusted Safety Companion",
  description: "Real-time safety scoring, route optimization, and emergency alerts to keep you protected wherever you go.",
  keywords: ["safety", "navigation", "emergency", "urban safety", "route planning", "crime prevention"],
  authors: [{ name: "SafeGuard Navigator Team" }],
  openGraph: {
    title: "SafeGuard Navigator",
    description: "Navigate safely, live confidently with real-time safety insights",
    url: "https://safeguard-navigator.com",
    siteName: "SafeGuard Navigator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeGuard Navigator",
    description: "Real-time safety scoring and route optimization",
  },
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}