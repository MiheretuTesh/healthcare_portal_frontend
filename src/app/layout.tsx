import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AppProvider } from "@/contexts/AppProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Healthcare Portal",
  description: "Healthcare management system for patients and claims",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          {/* Global toast container */}
          <div id="toast-root" className="fixed top-4 right-4 z-[1000] flex flex-col gap-3" />
        </AppProvider>
      </body>
    </html>
  );
}
