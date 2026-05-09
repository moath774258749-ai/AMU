import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { TelegramProvider } from "@/components/telegram-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Ubash - Earn Rewards | اربح المكافآت",
  description: "Earn points, complete tasks, and climb the leaderboard! | اربح النقاط وأكمل المهام وتصدر المتصدرين!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B1120",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" defer />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <TelegramProvider>
          <main className="pb-20 min-h-screen">
            {children}
          </main>
          <BottomNav />
        </TelegramProvider>
      </body>
    </html>
  );
}
