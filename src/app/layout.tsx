import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getPreviewState } from "@/lib/preview/state";
import { PreviewToolbar } from "@/components/preview/preview-toolbar";
import { ThemeScript } from "@/components/theme/theme-script";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "清華大學學生申訴協力系統",
  description: "學生申訴送件、追蹤與學權組織協作平台",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Development only; always null in production builds.
  const preview = await getPreviewState();

  return (
    // The theme script may set data-theme before hydration.
    <html lang="zh-Hant" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <TooltipProvider>
          {children}
          <Toaster />
          {preview ? (
            <Suspense>
              <PreviewToolbar state={preview} />
            </Suspense>
          ) : null}
        </TooltipProvider>
      </body>
    </html>
  );
}
