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
        }
    }, []);

    const setConsent = (newConsent: Consent) => {
        setConsentState(newConsent);
        if (newConsent) {
            localStorage.setItem("cookie_consent", newConsent);
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
