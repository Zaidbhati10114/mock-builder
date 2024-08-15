import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-providers";
import ConvexClerkProvider from "./providers/ConvexClerkProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import Navbar from "./_components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mock Builder",
  description: "Create mock data for your project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={cn("")}>
          <ConvexClerkProvider>{children}</ConvexClerkProvider>
          <Toaster />
        </body>
      </html>
    </>
  );
}
