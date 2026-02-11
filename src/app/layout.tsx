import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://postinet.pro";

export const metadata: Metadata = {
  title: "Postinet AI - Social Media Management",
  description: "Upload once. Schedule or post instantly to Facebook and YouTube.",
  metadataBase: new URL(appUrl),
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
      { url: "/logo.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Postinet AI - Social Media Management",
    description: "Upload once. Schedule or post instantly to Facebook and YouTube.",
    url: appUrl,
    siteName: "Postinet AI",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Postinet AI" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Postinet AI",
    description: "Upload once. Schedule or post instantly to Facebook and YouTube.",
    images: ["/logo.png"],
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
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

