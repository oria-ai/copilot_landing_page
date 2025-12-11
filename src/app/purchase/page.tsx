"use client";

import { useState } from "react";
import Image from "next/image";
import { FaCheck, FaStar } from "react-icons/fa";
import PlanSelector from "./_components/PlanSelector";
import PaymentForm from "./_components/PaymentForm";
import PurchaseFAQ from "./_components/PurchaseFAQ";
import Footer from "../../components/Footer";

export default function PurchasePage() {
    const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Minimal Header */}
            <header className="py-6 px-6 md:px-12 border-b border-white/10 flex justify-between items-center">
                <div className="font-bold text-xl tracking-tight">Photoleap</div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 box-shadow-green-glow"></span>
                    Secure Checkout
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-12 lg:grid lg:grid-cols-2 lg:gap-16">
                {/* Left Column: Benefits & Value */}
                <div className="space-y-10 mb-12 lg:mb-0">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                            Start your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">7-day free trial</span>
                        </h1>
                        <p className="text-xl text-gray-300 font-light">
                            Get full access to Photoleap: all-in-one photo editing & design app.
                        </p>
                    </div>

                    {/* Benefits List */}
                    <ul className="space-y-4">
                        {[
                            "Unlock all AI tools & features",
                            "100+ exclusive filters & effects",
                            "Remove objects & backgrounds instantly",
                            "Premium fonts, stickers & shapes",
                            "Ad-free editing experience",
                            "Cancel anytime during trial"
                        ].map((benefit, i) => (
                            <li key={i} className="flex items-center gap-3 text-lg">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <FaCheck size={12} />
                                </div>
                                {benefit}
                            </li>
                        ))}
                    </ul>

                    {/* Social Proof */}
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center gap-1 text-yellow-500">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <FaStar key={i} />
                            ))}
                        </div>
                        <p className="italic text-gray-300">
                            "This app is absolutely amazing! The AI features are mind-blowing and save me so much time."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                            <div>
                                <p className="font-bold text-sm">Sarah Jenkins</p>
                                <p className="text-xs text-gray-400">Content Creator</p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block relative h-64 w-full rounded-2xl overflow-hidden">
                        {/* Placeholder for a hero visual if available or a gradient pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-black border border-white/10 rounded-2xl flex items-center justify-center">
                            <span className="text-purple-300/30 text-6xl font-black rotate-12 select-none">Photoleap</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Checkout Form */}
                <div className="space-y-8">
                    <div className="bg-zinc-900/50 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-6">Select your plan</h2>

                        <PlanSelector selectedPlan={selectedPlan} onChange={setSelectedPlan} />

                        <div className="my-8 h-px bg-white/10" />

                        <h2 className="text-2xl font-bold mb-6">Payment details</h2>
                        <PaymentForm />

                        <button className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            Start Free Trial
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-4">
                            7 days free, then {selectedPlan === "yearly" ? "$39.99/year" : "$9.99/month"}. Cancel anytime.
                        </p>
                    </div>

                    <PurchaseFAQ />
                </div>
            </main>

            <Footer />
        </div>
    );
}
