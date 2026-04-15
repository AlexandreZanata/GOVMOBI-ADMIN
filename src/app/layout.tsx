import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GovMobile Admin Panel",
  description: "Internal system for public service operations",
};

/**
 * Root layout for the GovMobile Admin Panel.
 * Applies global fonts, CSS variables, and base body styles.
 *
 * @param children - Page or nested layout content
 * @returns HTML shell with font variables applied
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-neutral-50 text-neutral-900">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
