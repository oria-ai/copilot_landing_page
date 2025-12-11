import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
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
        {children}
        <Script src="/acctoolbar.min.js" strategy="afterInteractive" />
        <Script id="mic-access-tool-init" strategy="afterInteractive">
          {`
            window.addEventListener('load', function () {
              if (window.MicAccessTool) {
                new window.MicAccessTool({ forceLang: 'he-IL', buttonPosition: 'right' });
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
