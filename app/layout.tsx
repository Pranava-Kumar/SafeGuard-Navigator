import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import NavigationBar from "@/components/NavigationBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <NavigationBar />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}