import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-providers";
import ConvexClerkProvider from "./providers/ConvexClerkProvider";
import { Toaster as ToasterSonner } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import Navbar from "./_components/Navbar";
import { constructMetadata } from "../lib/utils";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <Script
        strategy="afterInteractive"
        src="https://cloud.umami.is/script.js"
        data-website-id="f3c9bb7f-3445-481a-82f0-3ed7259a95b1"
      />
      <body suppressHydrationWarning className={cn(inter.className)}>
        <ConvexClerkProvider>
          <ThemeProvider>
            {children}
            <ToasterSonner />
            <Toaster />
          </ThemeProvider>
        </ConvexClerkProvider>
      </body>
    </html>
  );
}
