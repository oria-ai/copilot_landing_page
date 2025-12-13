"use client";

import { useEffect } from 'react';

declare global {
    interface Window {
        UserWay?: {
            widgetOpen: () => void;
            widgetClose: () => void;
            widgetToggle: () => void;
            resetAll: () => void;
            iconVisibilityOn: () => void;
            iconVisibilityOff: () => void;
        };
    }
}

export default function Footer() {
    useEffect(() => {
        // Hide the UserWay icon when it initializes
        const hideIcon = () => {
            if (window.UserWay) {
                window.UserWay.iconVisibilityOff();
            }
        };

        // Listen for UserWay initialization
        document.addEventListener('userway:init_completed', hideIcon);

        // Also try to hide immediately in case it's already loaded
        hideIcon();

        return () => {
            document.removeEventListener('userway:init_completed', hideIcon);
        };
    }, []);

    const openAccessibilityMenu = () => {
        if (typeof window !== 'undefined' && window.UserWay) {
            window.UserWay.widgetOpen();
        }
    };

    return (
        <footer className="py-12 px-4 border-t border-white/10 bg-black text-gray-400 text-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-8">
                    <a href="/privacy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="/terms.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Service</a>

                    <button
                        onClick={openAccessibilityMenu}
                        className="hover:text-white transition-colors cursor-pointer"
                        aria-label="Open accessibility menu"
                    >
                        Accessibility
                    </button>
                </div>
                <div>
                    © 2025 HandsOnAI. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
