'use client';

import { Mail, ArrowRight, Loader2, X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBaseUrl } from '@/lib/url';
import { createClient } from '@/lib/supabase/client';
import { trackLoginWith } from '@/utils/userActions';

const PRE_AUTH_USER_ID_KEY = "affiliation_pre_auth_user_id";
const OAUTH_INTENT_PROVIDER_KEY = "affiliation_oauth_intent_provider";
const OAUTH_FALLBACK_USED_KEY = "affiliation_oauth_fallback_used";

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

export default function LoginPage() {
    const [supabase] = useState(() => createClient());
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isEmailMode, setIsEmailMode] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [authError, setAuthError] = useState<{ code: string | null; description: string | null } | null>(null);

    // Apple Login Mock State
    const [isAppleLoading, setIsAppleLoading] = useState(false);
    const [showAppleError, setShowAppleError] = useState(false);

    const BASE_URL = getBaseUrl();

    // Logic to hide the UserWay floating widget (copied from Trial page)
    useEffect(() => {
        const hideIcon = () => {
            if (window.UserWay) {
                window.UserWay.iconVisibilityOff();
            }
        };

        document.addEventListener('userway:init_completed', hideIcon);
        hideIcon();
        const interval = setInterval(hideIcon, 500);
        setTimeout(() => clearInterval(interval), 5000);

        return () => {
            document.removeEventListener('userway:init_completed', hideIcon);
            clearInterval(interval);
        };
    }, []);

    const rememberPreAuthUserIdIfAnonymous = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) return;
            const isAnonymous = Boolean((user as any)?.is_anonymous);
            if (isAnonymous && user?.id) {
                window.sessionStorage.setItem(PRE_AUTH_USER_ID_KEY, user.id);
            }
        } catch {
            // best-effort only
        }
    };

    // Parse callback errors and show them on the page.
    useEffect(() => {
        if (typeof window === "undefined") return;

        const url = new URL(window.location.href);
        const queryError = url.searchParams.get("error");
        const queryErrorCode = url.searchParams.get("error_code");
        const queryErrorDescription = url.searchParams.get("error_description");

        const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
        const hashParams = new URLSearchParams(hash);
        const hashError = hashParams.get("error");
        const hashErrorCode = hashParams.get("error_code");
        const hashErrorDescription = hashParams.get("error_description");

        const errorCode = queryErrorCode ?? hashErrorCode ?? (queryError || hashError);
        const errorDescription = queryErrorDescription ?? hashErrorDescription;

        if (errorCode || errorDescription) {
            setAuthError({ code: errorCode, description: errorDescription });

            // Clean the URL so a refresh doesn't keep showing the error.
            window.history.replaceState({}, "", "/login");
        }

        // If we attempted to link an OAuth identity to an anonymous user but that identity already exists
        // on another account, fall back to normal OAuth sign-in (common/expected case).
        if (errorCode === "identity_already_exists") {
            const provider = window.sessionStorage.getItem(OAUTH_INTENT_PROVIDER_KEY);
            const alreadyTried = window.sessionStorage.getItem(OAUTH_FALLBACK_USED_KEY) === "1";

            if ((provider === "google" || provider === "facebook") && !alreadyTried) {
                window.sessionStorage.setItem(OAUTH_FALLBACK_USED_KEY, "1");

                const redirectTo = `${BASE_URL}/auth/callback`;
                void supabase.auth.signInWithOAuth({
                    provider,
                    options: { redirectTo },
                });
            }
        }
    }, [BASE_URL, supabase]);

    const handleGoogleLogin = async () => {
        setAuthError(null);
        const redirectTo = `${BASE_URL}/auth/callback`;

        if (typeof window !== "undefined") {
            window.sessionStorage.setItem(OAUTH_INTENT_PROVIDER_KEY, "google");
            window.sessionStorage.removeItem(OAUTH_FALLBACK_USED_KEY);
        }

        const { data: { user } } = await supabase.auth.getUser();
        const isAnonymous = Boolean((user as any)?.is_anonymous);
        if (isAnonymous) {
            await rememberPreAuthUserIdIfAnonymous();
        }

        const { error } = isAnonymous
            ? await supabase.auth.linkIdentity({
                provider: "google",
                options: { redirectTo },
            })
            : await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo },
            });

        if (error) {
            console.error("Error logging in:", error.message);
            const errorCode = (error as unknown as { code?: string }).code ?? "AuthError";
            setAuthError({ code: errorCode, description: error.message });
        }
    };

    const handleGoogleLoginClick = async () => {
        await trackLoginWith("google");
        await handleGoogleLogin();
    };

    const handleFacebookLogin = async () => {
        setAuthError(null);
        const redirectTo = `${BASE_URL}/auth/callback`;

        if (typeof window !== "undefined") {
            window.sessionStorage.setItem(OAUTH_INTENT_PROVIDER_KEY, "facebook");
            window.sessionStorage.removeItem(OAUTH_FALLBACK_USED_KEY);
        }

        const { data: { user } } = await supabase.auth.getUser();
        const isAnonymous = Boolean((user as any)?.is_anonymous);
        if (isAnonymous) {
            await rememberPreAuthUserIdIfAnonymous();
        }

        const { error } = isAnonymous
            ? await supabase.auth.linkIdentity({
                provider: "facebook",
                options: { redirectTo },
            })
            : await supabase.auth.signInWithOAuth({
                provider: "facebook",
                options: { redirectTo },
            });

        if (error) {
            console.error("Error logging in:", error.message);
            const errorCode = (error as unknown as { code?: string }).code ?? "AuthError";
            setAuthError({ code: errorCode, description: error.message });
        }
    };

    const handleFacebookLoginClick = async () => {
        await trackLoginWith("facebook");
        await handleFacebookLogin();
    };

    const handleAppleLogin = async () => {
        void trackLoginWith("apple");
        setIsAppleLoading(true);
        // Simulate loading for 1 second
        setTimeout(() => {
            setIsAppleLoading(false);
            setShowAppleError(true);
        }, 1000);
    };

    const handleSendOtp = async () => {
        if (!email) return;
        await rememberPreAuthUserIdIfAnonymous();
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        setIsLoading(false);
        if (error) {
            alert('Error sending code: ' + error.message);
        } else {
            setIsVerifying(true);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return;
        setIsLoading(true);
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });
        setIsLoading(false);
        if (error) {
            alert('Error verifying code: ' + error.message);
        } else {
            window.location.href = '/trial';
        }
    };

    return (
        <main className="min-h-screen flex flex-col lg:flex-row bg-white text-gray-900 font-sans">

            {/* Desktop: Left Half Image Side */}
            <div className="hidden lg:block w-1/2 relative overflow-hidden bg-black">
                {/* Logo Top Left */}
                <div className="absolute top-8 left-8 z-30 flex items-center">
                    <div className="font-bold text-3xl tracking-tighter text-white">
                        Copilot<span className="text-accent-primary">Inside</span>
                    </div>
                </div>

                <div className="absolute inset-0 z-10 bg-gradient-to-t from-indigo-900/50 to-transparent pointer-events-none mix-blend-overlay" />
                <img
                    src="/login_hero.png"
                    alt="Login Visual"
                    className="w-full h-full object-cover"
                />

                {/* Center Overlay Text */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    {/* CONTROL POSITION HERE: Change 'translate-y-20' to move text up/down (e.g., translate-y-0 for center, translate-y-32 for lower) */}
                    <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-2xl translate-y-10">
                        7-day free trial
                    </h2>
                </div>
            </div>

            {/* Right Half: Light Mode Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center lg:justify-start lg:pt-22 p-6 md:p-12 relative bg-white">

                <div className="w-full max-w-md space-y-8 mt-10 lg:mt-0">
                    {(authError?.code || authError?.description) && (
                        <div className="w-[90%] mx-auto rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            <div className="font-bold">Login error</div>
                            <div className="mt-1">
                                {authError.code === "identity_already_exists"
                                    ? "This login method is already linked to another account. We’ll sign you in to that existing account instead."
                                    : (authError.description ?? "Authentication failed. Please try again.")}
                            </div>
                        </div>
                    )}
                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Continue to Copilot Inside</h1>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                            By signing in, you agree to our <a href="/terms-of-use.pdf" target="_blank" rel="noopener noreferrer" className="underline">Terms of use</a>, to receive offers and updates from Copilot Inside, and acknowledge our <a href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Google Button */}
                        {!isEmailMode && (
                            <button
                                onClick={handleGoogleLoginClick}
                                className="w-[90%] mx-auto flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm cursor-pointer"
                            >
                                <FcGoogle className="w-6 h-6" />
                                <span>Log in with Google</span>
                            </button>
                        )}

                        {/* Apple Button */}
                        {!isEmailMode && (
                            <button
                                onClick={handleAppleLogin}
                                className="w-[90%] mx-auto flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm cursor-pointer"
                            >
                                {isAppleLoading ? <Loader2 className="w-6 h-6 animate-spin text-gray-900" /> : <FaApple className="w-6 h-6" />}
                                <span>Log in with Apple</span>
                                <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-1 tracking-wide">iOS Only</span>
                            </button>
                        )}

                        {/* Email Button Logic */}
                        {!isEmailMode ? (
                            <button
                                onClick={() => {
                                    void trackLoginWith("email");
                                    void rememberPreAuthUserIdIfAnonymous();
                                    setIsEmailMode(true);
                                }}
                                className="w-[90%] mx-auto flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm cursor-pointer"
                            >
                                <Mail className="w-6 h-6 text-gray-900" />
                                <span>Log in with email</span>
                            </button>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {!isVerifying ? (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="email"
                                                placeholder="name@work-email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-[90%] mx-auto block pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:border-gray-900 focus:ring-0 outline-none transition-all"
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            onClick={handleSendOtp}
                                            disabled={isLoading || !/\S+@\S+\.\S+/.test(email)}
                                            className="w-[90%] mx-auto flex items-center justify-center gap-3 bg-gray-900 text-white font-bold py-4 px-6 rounded-full hover:bg-gray-800 transition-colors text-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Login Code'}
                                        </button>
                                        <button onClick={() => setIsEmailMode(false)} className="w-full text-sm text-gray-500 hover:text-gray-900 cursor-pointer">
                                            Back to options
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-center mb-2">
                                            <p className="text-sm text-gray-600">Enter the code sent to <span className="font-semibold">{email}</span></p>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full text-center tracking-[1em] font-mono text-xl py-4 rounded-full border border-gray-300 focus:border-gray-900 focus:ring-0 outline-none transition-all"
                                            autoFocus
                                            maxLength={6}
                                        />
                                        <button
                                            onClick={handleVerifyOtp}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-bold py-4 px-6 rounded-full hover:bg-gray-800 transition-colors text-lg shadow-sm disabled:opacity-50 cursor-pointer"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                                        </button>
                                        <button onClick={() => setIsVerifying(false)} className="w-full text-sm text-gray-500 hover:text-gray-900 cursor-pointer">
                                            Wrong email?
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Facebook Button */}
                        {/* Facebook Button */}
                        {/* More Options / Facebook */}
                        {!isEmailMode && (
                            <div className="pt-2 flex flex-col gap-3">
                                {showMoreOptions && (
                                    <button
                                        onClick={handleFacebookLoginClick}
                                        className="w-[90%] mx-auto flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm animate-in fade-in slide-in-from-top-2 cursor-pointer"
                                    >
                                        <FaFacebook className="w-6 h-6 text-[#1877F2]" />
                                        <span>Log in with Facebook</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                                    className="w-full text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1 mx-auto font-medium cursor-pointer"
                                >
                                    {showMoreOptions ? (
                                        <>Show less <span className="text-[10px] rotate-180 transition-transform">▼</span></>
                                    ) : (
                                        <>More login options <span className="text-[10px] transition-transform">▼</span></>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Links (From Trial Page) */}
                <div className="lg:absolute bottom-8 w-full text-center px-4 mt-auto lg:mt-0 pt-8 lg:pt-0">
                    <div className="mx-auto w-[90%] border-t border-gray-100 mb-6"></div>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
                        <Link href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors cursor-pointer">Privacy Policy</Link>
                        <span className="hidden sm:inline text-gray-300">|</span>
                        <Link href="/terms-of-use.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors cursor-pointer">Terms of Use</Link>
                        <span className="hidden sm:inline text-gray-300">|</span>
                        <button
                            className="hover:text-gray-900 transition-colors cursor-pointer"
                            onClick={() => window.UserWay?.widgetOpen?.()}
                        >
                            Accessibility
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-2">
                        <span>HandsOnAI</span>
                        <span>© 2025 All rights reserved</span>
                    </div>
                </div>
            </div>

            {/* Apple Login Error Modal */}
            {showAppleError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowAppleError(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaApple className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Login Failed</h3>
                            <p className="text-gray-500 text-sm">
                                Sorry, we couldn't connect to Apple. Please try another login method.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setShowAppleError(false);
                                    void handleGoogleLogin();
                                }}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                            >
                                <FcGoogle className="w-5 h-5" />
                                Continue with Google
                            </button>
                            <button
                                onClick={() => { setShowAppleError(false); setIsEmailMode(true); }}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                            >
                                <Mail className="w-5 h-5" />
                                Continue with Email
                            </button>
                            <button
                                onClick={() => {
                                    setShowAppleError(false);
                                    void handleFacebookLogin();
                                }}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                            >
                                <FaFacebook className="w-5 h-5 text-[#1877F2]" />
                                Continue with Facebook
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fallback CSS to hide widget trigger if JS fails/lags */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .uway_widget_trigger { display: none !important; }
        iframe[title="Accessibility Menu"] { display: none !important; } 
        #userway-accessibility-widget { display: none !important; }
      `}} />
        </main>
    );
}
