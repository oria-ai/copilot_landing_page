'use client';

import { Apple, Chrome, Mail, Monitor, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isEmailMode, setIsEmailMode] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) console.error('Error logging in:', error.message);
    };

    const handleMicrosoftLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'azure',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: 'email',
            },
        });
        if (error) console.error('Error logging in:', error.message);
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
            window.location.href = '/dashboard';
        }
    };
    return (
        <main className="min-h-screen flex flex-col lg:flex-row bg-white text-gray-900 font-sans">

            {/* Desktop: Left Half Image Side */}
            <div className="hidden lg:block w-1/2 relative overflow-hidden bg-black">
                {/* Logo Top Left */}
                <div className="absolute top-8 left-8 z-30 flex items-center gap-3">
                    <img src="/Gemini_Generated_Image_m14tzom14tzom14t__1_-removebg-preview.png" alt="Copilot Inside Logo" className="w-24 h-24 object-contain" />
                    <div className="flex flex-col">
                        <span className="font-bold text-2xl tracking-tighter text-white leading-none">
                            Copilot<span className="text-accent-primary">Inside</span>
                        </span>
                        <span className="text-xs font-medium text-gray-300 leading-none opacity-80 mt-1">
                            by HandsOnAI
                        </span>
                    </div>
                </div>

                <div className="absolute inset-0 z-10 bg-gradient-to-t from-indigo-900/50 to-transparent pointer-events-none mix-blend-overlay" />
                <img
                    src="/artifacts/adaptive_learning_flow_1765320088222.png"
                    alt="Login Visual"
                    className="w-full h-full object-cover opacity-90"
                />

                {/* Center Overlay Text */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <h2 className="text-6xl font-bold text-white tracking-tight drop-shadow-2xl">
                        7-day free trial
                    </h2>
                </div>
            </div>

            {/* Right Half: Light Mode Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative bg-white">

                <div className="w-full max-w-md space-y-8 mt-10 lg:mt-0">
                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Continue to Copilot Inside</h1>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                            By signing in, you agree to our <a href="#" className="underline">Terms of use</a>, to receive offers and updates from Copilot Inside, and acknowledge our <a href="#" className="underline">Privacy Policy</a>.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {!isEmailMode ? (
                            <>
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm cursor-pointer"
                                >
                                    <Chrome className="w-5 h-5" />
                                    Log in with Google
                                </button>
                                <button
                                    onClick={handleMicrosoftLogin}
                                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm"
                                >
                                    <Monitor className="w-5 h-5" />
                                    Log in with Microsoft
                                </button>
                                <button
                                    onClick={() => setIsEmailMode(true)}
                                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-4 px-6 rounded-full hover:bg-gray-50 transition-colors text-lg shadow-sm"
                                >
                                    <Mail className="w-5 h-5" />
                                    Log in with email
                                </button>
                            </>
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
                                            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-bold py-4 px-6 rounded-full hover:bg-gray-800 transition-colors text-lg shadow-sm disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Login Code'}
                                        </button>
                                        <button onClick={() => setIsEmailMode(false)} className="w-full text-sm text-gray-500 hover:text-gray-900">
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
                                            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-bold py-4 px-6 rounded-full hover:bg-gray-800 transition-colors text-lg shadow-sm disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                                        </button>
                                        <button onClick={() => setIsVerifying(false)} className="w-full text-sm text-gray-500 hover:text-gray-900">
                                            Wrong email?
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="text-center pt-2">
                        <button className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1 mx-auto font-medium">
                            More login options <span className="text-[10px]">▼</span>
                        </button>
                    </div>

                    <div className="flex items-start gap-3 pt-4">
                        <input type="checkbox" id="promotions" className="mt-1 rounded border-gray-300" />
                        <label htmlFor="promotions" className="text-xs text-gray-400">I do not wish to receive promotions and updates from Copilot Inside</label>
                    </div>
                </div>

                {/* Footer Links (Absolute bottom > lg, Static < lg) */}
                <div className="lg:absolute bottom-8 w-full text-center px-4 mt-12 lg:mt-0">
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 text-xs text-gray-400">
                        <a href="#" className="hover:underline">Help center</a>
                        <span className="text-gray-300">|</span>
                        <a href="#" className="hover:underline">Billing help</a>
                        <span className="text-gray-300">|</span>
                        <a href="#" className="hover:underline">Contact us</a>
                        <span className="text-gray-300">|</span>
                        <a href="#" className="hover:underline">Cookie Preferences</a>
                        <span className="text-gray-300">|</span>
                        <a href="#" className="hover:underline">Accessibility</a>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mt-4">
                        <a href="#" className="hover:underline">Terms of use</a>
                        <a href="#" className="hover:underline">Refund policy</a>
                        <a href="#" className="hover:underline">Privacy Policy</a>
                        <a href="#" className="hover:underline">Data Subject Rights</a>
                    </div>
                    <div className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-2">
                        <span>Copilot Inside</span>
                        <span>© 2025 All rights reserved</span>
                    </div>
                </div>
            </div>
        </main>
    )
}
