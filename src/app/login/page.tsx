'use client';

import { Mail, ArrowRight, Loader2, X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBaseUrl } from '@/lib/url';
import { createClient } from '@/lib/supabase/client';

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
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isEmailMode, setIsEmailMode] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showMoreOptions, setShowMoreOptions] = useState(false);

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

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${BASE_URL}/auth/callback`,
            },
        });
        if (error) console.error('Error logging in:', error.message);
    };

    const handleFacebookLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: `${BASE_URL}/auth/callback`,
            },
        });
        if (error) console.error('Error logging in:', error.message);
    };

    const handleAppleLogin = async () => {
        setIsAppleLoading(true);
        // Simulate loading for 1 second
        setTimeout(() => {
            setIsAppleLoading(false);
            setShowAppleError(true);
        }, 1000);
    };

    const handleSendOtp = async () => {
        if (!email) return;
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
                <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
                    <img src="/logo_text.png" alt="Copilot Inside Logo" className="h-20 w-auto object-contain" />
                </div>


            </div>

            {/* Right Half: Light Mode Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative bg-white">

                <div className="w-full max-w-md space-y-8 mt-10 lg:mt-0">
                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Continue to Copilot Inside</h1>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                            By signing in, you agree to our <a href="/terms.pdf" target="_blank" rel="noopener noreferrer" className="underline">Terms of use</a>, to receive offers and updates from Copilot Inside, and acknowledge our <a href="/privacy.pdf" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Google Button */}
                        {!isEmailMode && (
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm cursor-pointer"
                            >
                                <FcGoogle className="w-6 h-6" />
                                <span>Log in with Google</span>
                            </button>
                        )}

                        {/* Apple Button */}
                        {!isEmailMode && (
                            <button
                                onClick={handleAppleLogin}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm cursor-pointer"
                            >
                                {isAppleLoading ? <Loader2 className="w-6 h-6 animate-spin text-gray-900" /> : <FaApple className="w-6 h-6" />}
                                <span>Log in with Apple</span>
                                <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-1 tracking-wide">iOS Only</span>
                            </button>
                        )}

                        {/* Email Button Logic */}
                        {!isEmailMode ? (
                            <button
                                onClick={() => setIsEmailMode(true)}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm cursor-pointer"
                            >
                                <Mail className="w-6 h-6 text-gray-900" />
                                <span>Log in with email</span>
                            </button>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {!isVerifying ? (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="email"
                                                placeholder="name@work-email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:border-gray-900 focus:ring-0 outline-none transition-all"
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            onClick={handleSendOtp}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-bold py-4 px-6 rounded-full hover:bg-gray-800 transition-colors text-lg shadow-sm disabled:opacity-50 cursor-pointer"
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
                        {/* More Options / Facebook */}
                        <div className="pt-2 flex flex-col gap-3">
                            {showMoreOptions && (
                                <button
                                    onClick={handleFacebookLogin}
                                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm animate-in fade-in slide-in-from-top-2 cursor-pointer"
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
                    </div>
                </div>

                {/* Footer Links (From Trial Page) */}
                <div className="lg:absolute bottom-8 w-full text-center px-4 mt-auto lg:mt-0 pt-8 lg:pt-0">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
                        <Link href="/privacy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors cursor-pointer">Privacy Policy</Link>
                        <span className="hidden sm:inline text-gray-300">|</span>
                        <Link href="/terms.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors cursor-pointer">Terms of Use</Link>
                        <span className="hidden sm:inline text-gray-300">|</span>
                        <button
                            className="hover:text-gray-900 transition-colors cursor-pointer"
                            onClick={() => window.UserWay?.widgetOpen?.()}
                        >
                            Accessibility
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-2">
                        <span>Copilot Inside</span>
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
                                onClick={() => { setShowAppleError(false); handleGoogleLogin(); }}
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
                                onClick={() => { setShowAppleError(false); handleFacebookLogin(); }}
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
