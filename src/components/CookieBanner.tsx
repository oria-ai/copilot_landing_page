"use client";

import { useCookieConsent } from "@/lib/CookieConsentContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6 md:p-8 overflow-hidden"
                    >
                        <div className="text-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Cookie Preferences
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    We use cookies to enhance site navigation, analyze site usage, and
                                    assist in our marketing efforts. By clicking “Allow All”, you agree
                                    to the storing of cookies on your device.{" "}
                                    <Link
                                        href={cookiePolicyLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-violet-600 hover:text-violet-700 hover:underline"
                                    >
                                        Read Policy
                                    </Link>
                                    .
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={() => setConsent("granted")}
                                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-200 cursor-pointer"
                                >
                                    Allow All
                                </button>

                                <button
                                    onClick={() => setConsent("denied")}
                                    className="w-full bg-transparent hover:bg-gray-50 text-gray-500 font-semibold py-3 rounded-full transition-all active:scale-[0.98] text-sm cursor-pointer"
                                >
                                    Deny
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
