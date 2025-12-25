"use client";

import { FaPaypal, FaApple, FaGoogle, FaShieldAlt, FaLock } from "react-icons/fa";
import { SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MaintenancePopup from "./MaintenancePopup";
import { trackPaymentMethodClick, trackUserClick } from "@/utils/userActions";

interface ExpressPaymentProps {
    initialPopupOpen?: boolean;
}

export default function ExpressPayment({ initialPopupOpen = false }: ExpressPaymentProps) {
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(initialPopupOpen);
    const router = useRouter();

    // Sync state if prop changes (though mainly for initial load)
    useEffect(() => {
        if (initialPopupOpen) {
            setIsMaintenanceOpen(true);
        }
    }, [initialPopupOpen]);

    const handlePaymentClick = (method: "card" | "paypal" | "ios") => {
        void trackPaymentMethodClick(method); // indicates payment intent (no actual charge)
        void trackUserClick("purchase");
        setIsMaintenanceOpen(true);
    };

    return (
        <section className="bg-white py-12 px-4 relative z-10" id="payment-section">
            <div className="max-w-md mx-auto space-y-10">
                {/* Trial Header */}
                <div className="text-center space-y-1">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                        7-day free trial
                    </h2>
                    <p className="text-base text-gray-600 font-bold">then $7.50/month</p>
                </div>

                {/* Summary Box */}
                <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm text-gray-500 border-b border-gray-100 pb-4 font-medium">
                        <span>Yearly Plan</span>
                        <span>$90.00/year</span>
                    </div>

                    <div className="text-center pt-2 space-y-1">
                        <div className="text-3xl font-bold text-green-500">
                            Pay now: $0.00
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                            Pay on December 20, 2025: $90.00 (Billed Yearly)
                        </p>
                    </div>
                </div>

                <div className="h-px bg-gray-100 w-full" />

                {/* Payment Methods */}
                <div className="space-y-3">
                    <h3 className="font-bold text-gray-700 text-base">Payment Method</h3>

                    {/* PayPal */}
                    <button
                        onClick={() => handlePaymentClick("paypal")}
                        className="w-full bg-[#FFC439] hover:bg-[#F4BB30] h-12 rounded-md flex items-center justify-center transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-sm cursor-pointer"
                    >
                        <span className="sr-only">Pay with PayPal</span>
                        <FaPaypal size={20} className="text-[#003087]" />
                        <span className="font-bold text-[#003087] italic text-lg ml-1">PayPal</span>
                    </button>

                    {/* Apple/Google Pay */}
                    <button
                        onClick={() => handlePaymentClick("ios")}
                        className="w-full bg-black hover:bg-gray-900 h-12 rounded-md flex items-center justify-center gap-2 text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-sm cursor-pointer"
                    >
                        <FaApple size={20} />
                        <span className="font-medium text-sm">Pay</span>
                        <span className="mx-2 text-gray-500 text-sm">|</span>
                        <FaGoogle size={16} />
                        <span className="font-medium text-sm">Pay</span>
                        <span className="ml-2 font-mono text-gray-400 text-xs">•••• 4909</span>
                    </button>

                    {/* Credit Card */}
                    <button
                        onClick={() => handlePaymentClick("card")}
                        className="w-full bg-white border border-gray-300 hover:border-gray-400 h-12 rounded-md flex items-center justify-center gap-3 text-gray-700 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-sm cursor-pointer"
                    >
                        <div className="flex gap-2 text-xl">
                            <SiVisa className="text-[#1A1F71]" />
                            <SiMastercard className="text-[#EB001B]" />
                            <SiAmericanexpress className="text-[#2E77BC]" />
                        </div>
                        <span className="font-bold text-sm">Credit/Debit</span>
                    </button>
                </div>

                {/* Trust Footer */}
                <div className="mt-6 text-center space-y-3">
                    <div className="flex items-center justify-center gap-1.5 text-green-600 font-bold text-sm">
                        <FaLock size={12} />
                        Secure Checkout
                    </div>
                    <div className="flex justify-center gap-2 opacity-60">
                        <div className="h-6 w-10 border border-gray-200 rounded flex items-center justify-center"><SiVisa size={16} /></div>
                        <div className="h-6 w-10 border border-gray-200 rounded flex items-center justify-center"><SiMastercard size={16} /></div>
                        <div className="h-6 w-10 border border-gray-200 rounded flex items-center justify-center"><FaShieldAlt size={16} /></div>
                    </div>
                </div>
            </div>

            <MaintenancePopup
                isOpen={isMaintenanceOpen}
                onClose={() => setIsMaintenanceOpen(false)}
                onJoinWaitlist={() => setIsMaintenanceOpen(false)}
            />
        </section>
    );
}
