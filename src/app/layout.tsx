import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { AnimationProvider } from "@/lib/AnimationContext";
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
  title: "Copilot Inside",
  description: "The all-in-one platform for Copilot mastery.",
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
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="u9qKBcpIlF"
          strategy="afterInteractive"
        />
        <AnimationProvider>
          {children}
        </AnimationProvider>
      </body>
    </html>
  );
}
