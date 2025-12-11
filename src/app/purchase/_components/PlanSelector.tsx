"use client";

import { motion } from "framer-motion";

interface PlanSelectorProps {
    selectedPlan: "yearly" | "monthly";
    onChange: (plan: "yearly" | "monthly") => void;
}

export default function PlanSelector({ selectedPlan, onChange }: PlanSelectorProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* Yearly Plan */}
            <div
                onClick={() => onChange("yearly")}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedPlan === "yearly"
                        ? "border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                        : "border-white/10 hover:border-white/20 bg-white/5"
                    }`}
            >
                {selectedPlan === "yearly" && (
                    <motion.div
                        layoutId="active-plan"
                        className="absolute inset-0 rounded-xl border-2 border-purple-500"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                <div className="relative flex items-center gap-4 z-10 w-full">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === "yearly" ? "border-purple-500" : "border-gray-500"}`}>
                        {selectedPlan === "yearly" && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">Yearly Access</span>
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                SAVE 50%
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm">Billed yearly • 7-day free trial</p>
                    </div>
                </div>

                <div className="relative text-right z-10">
                    <p className="font-bold text-xl">$3.33<span className="text-sm font-normal text-gray-400">/mo</span></p>
                    <p className="text-gray-500 text-xs line-through">$6.66/mo</p>
                </div>
            </div>

            {/* Monthly Plan */}
            <div
                onClick={() => onChange("monthly")}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedPlan === "monthly"
                        ? "border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                        : "border-white/10 hover:border-white/20 bg-white/5"
                    }`}
            >
                {selectedPlan === "monthly" && (
                    <motion.div
                        layoutId="active-plan"
                        className="absolute inset-0 rounded-xl border-2 border-purple-500"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                <div className="relative flex items-center gap-4 z-10 w-full">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === "monthly" ? "border-purple-500" : "border-gray-500"}`}>
                        {selectedPlan === "monthly" && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                    </div>
                    <div>
                        <span className="font-bold text-lg">Monthly Access</span>
                        <p className="text-gray-400 text-sm">Billed monthly</p>
                    </div>
                </div>

                <div className="relative text-right z-10">
                    <p className="font-bold text-xl">$9.99<span className="text-sm font-normal text-gray-400">/mo</span></p>
                </div>
            </div>
        </div>
    );
}
