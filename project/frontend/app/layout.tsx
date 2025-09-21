import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import LogoutButton from "@/components/LogoutButton";
import UserInfo from "@/components/UserInfo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My App",
  description: "Next.js application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased !bg-gray-800 min-h-screen`}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
          <a
            href="/"
            className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition"
          >
            App
          </a>

          <div className="flex items-center gap-3">
            <UserInfo />
            <LogoutButton />
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
