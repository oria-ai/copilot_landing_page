"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, Bell, CheckCircle } from "lucide-react";
import { trackTrialClick } from '@/utils/userActions';
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

export default function TrialPage() {
    const step1Ref = useRef<HTMLDivElement>(null);
    const step2Ref = useRef<HTMLDivElement>(null);
    const [filledLineHeight, setFilledLineHeight] = useState(0);
    const [user, setUser] = useState<{ email?: string } | null>(null);
    const supabase = createClient();
    const router = useRouter();

    // Logic to calculate dynamic line height
    useEffect(() => {
        const calculateHeight = () => {
            if (step1Ref.current && step2Ref.current) {
                const box1 = step1Ref.current.getBoundingClientRect();
                const box2 = step2Ref.current.getBoundingClientRect();
                const distance = box2.top - box1.top;
                setFilledLineHeight(distance * 0.5); // Fill exactly half the distance
            }
        };

        calculateHeight();
        window.addEventListener('resize', calculateHeight);
        return () => window.removeEventListener('resize', calculateHeight);
    }, []);

    // Logic to hide the UserWay floating widget
    useEffect(() => {
        const hideIcon = () => {
            if (window.UserWay) {
                window.UserWay.iconVisibilityOff();
            }
        };

        document.addEventListener('userway:init_completed', hideIcon);

        // Attempt to hide immediately
        hideIcon();

        // Also set an interval to check for a few seconds in case of race conditions
        const interval = setInterval(hideIcon, 500);
        setTimeout(() => clearInterval(interval), 5000);

        // Check for logged in user
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        return () => {
            document.removeEventListener('userway:init_completed', hideIcon);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="flex h-screen flex-col lg:flex-row bg-white overflow-hidden">
            {/* Left Side - Image */}
            <div className="relative hidden lg:block lg:w-[52%] overflow-hidden bg-gray-50">
                <Image
                    src="/man_using_copilot.png"
                    alt="Man using Copilot"
                    fill
                    className="object-cover object-top"
                    priority
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-violet-500/5 mix-blend-multiply" />
            </div>

            {/* Right Side - Content */}
            <div className="flex w-full flex-col bg-white lg:w-[48%] h-full">

                {/* Main Content Area */}
                <div className="flex flex-col justify-center flex-grow px-6 lg:px-12 py-4">
                    <div className="mx-auto w-full max-w-[420px]">

                        {/* Header */}
                        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900 xl:text-4xl whitespace-nowrap">
                            How your free trial works
                        </h1>

                        <div className="relative space-y-8 xl:space-y-10">

                            {/* Continuous Vertical Line (Background) */}
                            <div className="absolute left-[18px] top-5 bottom-2 w-1 bg-violet-100/80" />

                            {/* Filled Active Line (Dynamic) */}
                            <div
                                className="absolute left-[18px] top-5 w-1 bg-violet-600 transition-all duration-300 ease-out"
                                style={{ height: `${filledLineHeight}px` }}
                            />

                            {/* Step 1 */}
                            <div className="relative flex items-start gap-5">
                                <div
                                    ref={step1Ref}
                                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg ring-8 ring-white"
                                >
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-lg font-bold text-gray-900">Today: Start free trial</h3>
                                    <p className="mt-1 text-[15px] text-gray-600 leading-relaxed">
                                        Unlock access to all Copilot tools.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex items-start gap-5">
                                <div
                                    ref={step2Ref}
                                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 ring-8 ring-white"
                                >
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-lg font-bold text-gray-900">Day 5: Trial reminder</h3>
                                    <p className="mt-1 text-[15px] text-gray-600 leading-relaxed">
                                        You'll get a reminder via email that your trial is about to end.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex items-start gap-5">
                                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 ring-8 ring-white">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-lg font-bold text-gray-900">Day 7: Subscription begins</h3>
                                    <p className="mt-1 text-[15px] text-gray-600 leading-relaxed">
                                        Your subscription will begin and you'll be charged. Cancel anytime before.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-center">
                            <Link
                                href="/purchase"
                                onClick={() => void trackTrialClick()}
                                className="block w-full max-w-[320px] rounded-full bg-gray-900 py-4 text-center text-lg font-bold text-white transition-all hover:bg-black hover:scale-105 active:scale-95 shadow-xl"
                            >
                                Continue
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto py-6 text-center">
                    {/* Centered separator line */}
                    <div className="mx-auto w-[90%] border-t border-gray-100 mb-6"></div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
                            <Link href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
                            <span className="hidden sm:inline text-gray-300">|</span>
                            <Link href="/terms-of-use.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Terms of Use</Link>
                            <span className="hidden sm:inline text-gray-300">|</span>
                            <button
                                className="hover:text-gray-900 transition-colors"
                                onClick={() => window.UserWay?.widgetOpen?.()}
                            >
                                Accessibility
                            </button>
                        </div>

                        {/* User status */}
                        {user && user.email && (
                            <div className="text-xs text-gray-500 mt-1">
                                <span>Logged in as {user.email}, </span>
                                <button
                                    onClick={handleLogout}
                                    className="hover:text-gray-900 transition-colors underline cursor-pointer"
                                >
                                    log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fallback CSS to hide widget trigger if JS fails/lags */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .uway_widget_trigger { display: none !important; }
        iframe[title="Accessibility Menu"] { display: none !important; } 
        #userway-accessibility-widget { display: none !important; }
      `}} />
        </div>
    );
}
