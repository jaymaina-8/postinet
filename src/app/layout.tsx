import type { Metadata } from "next";
import { ReactNode } from "react";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Postinet AI - Social Media Management",
  description: "AI-powered social media content management and scheduling",
  icons: {
    icon: "/favicon.ico",
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

