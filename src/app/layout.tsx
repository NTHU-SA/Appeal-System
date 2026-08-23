import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "清華大學學生申訴協力系統",
  description: "學生申訴送件、追蹤與學權組織協作平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh">
        <TooltipProvider>
          {children}
          <SiteFooter />
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
