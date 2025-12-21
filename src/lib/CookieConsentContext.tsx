"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Consent = "granted" | "denied" | null;

interface CookieConsentContextType {
    consent: Consent;
    setConsent: (consent: Consent) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(
    undefined
);

declare global {
    interface Window {
        dataLayer: any[];
    }
}

function updateGtmConsent(consent: Consent) {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
        window.dataLayer.push(args);
    }

    const value = consent === "granted" ? "granted" : "denied";

    gtag("consent", "update", {
        ad_storage: value,
        ad_user_data: value,
        ad_personalization: value,
        analytics_storage: value,
    });

    // Push a custom event that GTM can trigger on
    window.dataLayer.push({ event: "co_consent_update" });
}

export const CookieConsentProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [consent, setConsentState] = useState<Consent>(null);

    useEffect(() => {
        const storedConsent = localStorage.getItem("cookie_consent");
        if (storedConsent === "granted" || storedConsent === "denied") {
            setConsentState(storedConsent);
            updateGtmConsent(storedConsent);
        }
    }, []);

    const setConsent = (newConsent: Consent) => {
        setConsentState(newConsent);
        if (newConsent) {
            localStorage.setItem("cookie_consent", newConsent);
            updateGtmConsent(newConsent);
        }
    };

    return (
        <CookieConsentContext.Provider value={{ consent, setConsent }}>
            {children}
        </CookieConsentContext.Provider>
    );
};

export const useCookieConsent = () => {
    const context = useContext(CookieConsentContext);
    if (context === undefined) {
        throw new Error(
            "useCookieConsent must be used within a CookieConsentProvider"
        );
    }
    return context;
};
