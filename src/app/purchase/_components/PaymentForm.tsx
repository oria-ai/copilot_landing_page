"use client";

import { useState } from "react";
import { FaLock, FaCreditCard, FaPaypal, FaApple, FaGoogle } from "react-icons/fa";
import { trackPaymentMethodClick } from "@/utils/userActions";

export default function PaymentForm() {
    const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple">("card");

    return (
        <div className="flex flex-col gap-6">
            {/* Payment Method Selector */}
            <div className="flex gap-4">
                <button
                    onClick={() => {
                        setPaymentMethod("card");
                        void trackPaymentMethodClick("card");
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 font-medium transition-all ${paymentMethod === "card"
                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                        : "border-white/10 hover:border-white/20 text-gray-400"
                        }`}
                >
                    <FaCreditCard /> Card
                </button>
                <button
                    onClick={() => {
                        setPaymentMethod("paypal");
                        void trackPaymentMethodClick("paypal");
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 font-medium transition-all ${paymentMethod === "paypal"
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-white/10 hover:border-white/20 text-gray-400"
                        }`}
                >
                    <FaPaypal /> PayPal
                </button>
                <button
                    onClick={() => {
                        setPaymentMethod("apple");
                        void trackPaymentMethodClick("apple");
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 font-medium transition-all ${paymentMethod === "apple"
                        ? "border-gray-200 bg-white/10 text-white"
                        : "border-white/10 hover:border-white/20 text-gray-400"
                        }`}
                >
                    <FaApple size={20} /> Pay
                </button>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                    <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>

                {paymentMethod === "card" && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Card Information</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                                <FaCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry Date</label>
                                <input
                                    type="text"
                                    placeholder="MM / YY"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">CVC</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Zip Code</label>
                            <input
                                type="text"
                                placeholder="10001"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>
                )}

                {paymentMethod === "paypal" && (
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-200 text-sm">
                        You will be redirected to PayPal to complete your purchase securely.
                    </div>
                )}

                {paymentMethod === "apple" && (
                    <div className="p-4 bg-gray-500/10 rounded-lg border border-gray-500/20 text-gray-200 text-sm flex flex-col items-center gap-2">
                        <FaApple size={32} />
                        <p>Proceed with Apple Pay to complete your purchase securely.</p>
                    </div>
                )}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1"><FaLock size={12} /> Secure Payment</div>
                <div className="w-1 h-1 bg-gray-600 rounded-full" />
                <div>Encrypted for your safety</div>
            </div>
        </div>
    );
}
