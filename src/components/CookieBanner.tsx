"use client";

import { useCookieConsent } from "@/lib/CookieConsentContext";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CookieBannerProps {
    cookiePolicyLink: string;
}

export default function CookieBanner({ cookiePolicyLink }: CookieBannerProps) {
    const { consent, setConsent } = useCookieConsent();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show banner if consent hasn't been set yet
        if (consent === null) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [consent]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 md:p-6 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-300 flex-1">
                    <p>
                        By clicking “Allow All”, you agree to the storage of cookies on your
                        device to enhance site navigation, analyze site usage, and assist in
                        our marketing efforts.{" "}
                        <Link
                            href={cookiePolicyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Read the Cookie Policy
                        </Link>
                        .
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => setConsent("denied")}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                        Deny
                    </button>
                    <button
                        onClick={() => setConsent("granted")}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Allow All
                    </button>
                </div>
            </div>
        </div>
    );
}
