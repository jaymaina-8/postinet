import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://postinet.pro";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Postinet AI - Social Media Management",
  description: "Upload once. Schedule or post instantly to Facebook and YouTube.",
  metadataBase: new URL(appUrl),
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    // NOTE: We don't ship an apple touch icon yet. Add `/public/apple-icon.png` later if needed.
  },
  openGraph: {
    title: "Postinet AI - Social Media Management",
    description: "Upload once. Schedule or post instantly to Facebook and YouTube.",
    url: appUrl,
    siteName: "Postinet AI",
    images: [{ url: "/logo.svg", alt: "Postinet AI" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Postinet AI",
    description: "Upload once. Schedule or post instantly to Facebook and YouTube.",
    images: ["/logo.svg"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Postinet AI",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-[#0a0a0a]">
      <body className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

