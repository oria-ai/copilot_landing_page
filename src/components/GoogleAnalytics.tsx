"use client";

import { useCookieConsent } from "@/lib/CookieConsentContext";
import Script from "next/script";

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
    const { consent } = useCookieConsent();

    if (consent !== "granted") {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
            </Script>
        </>
    );
}
