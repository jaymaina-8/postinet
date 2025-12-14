import type { Metadata } from "next";
import { ReactNode } from "react";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "POSTINET AI",
  description: "AI-powered social media content management",
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

