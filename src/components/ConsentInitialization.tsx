"use client";

import Script from "next/script";

export default function ConsentInitialization() {
    return (
        <Script id="consent-init" strategy="afterInteractive">
            {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        
        // Define default consent mode state
        gtag('consent', 'default', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'analytics_storage': 'denied',
          'wait_for_update': 500
        });
      `}
        </Script>
    );
}
