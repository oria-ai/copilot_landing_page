"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';

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
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    const pathname = usePathname();
    const router = useRouter();

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

        // Check for logged in user
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        return () => {
            document.removeEventListener('userway:init_completed', hideIcon);
        };
    }, []);

    const openAccessibilityMenu = () => {
        if (typeof window !== 'undefined' && window.UserWay) {
            window.UserWay.widgetOpen();
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();

        if (pathname === '/purchase') {
            router.push('/login');
        } else {
            window.location.reload();
        }
    };

    return (
        <footer className="py-12 px-4 border-t border-white/10 bg-black text-gray-400 text-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <div className="flex gap-8">
                        <a href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="/terms-of-use.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Use</a>

                        <button
                            onClick={openAccessibilityMenu}
                            className="hover:text-white transition-colors cursor-pointer"
                            aria-label="Open accessibility menu"
                        >
                            Accessibility
                        </button>
                    </div>

                    {user && user.email && (
                        <div className="flex items-center gap-1 text-gray-400">
                            <span>Logged in as {user.email}, </span>
                            <button
                                onClick={handleLogout}
                                className="hover:text-white transition-colors underline cursor-pointer"
                            >
                                log out
                            </button>
                        </div>
                    )}
                </div>
                <div>
                    © 2025 HandsOnAI. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
