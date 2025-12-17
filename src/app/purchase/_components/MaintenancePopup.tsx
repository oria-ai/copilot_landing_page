"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { trackWaitlistClick } from '@/utils/userActions';

interface MaintenancePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onJoinWaitlist: () => void;
}

export default function MaintenancePopup({ isOpen, onClose, onJoinWaitlist }: MaintenancePopupProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6 md:p-8 overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center space-y-6">
                            {/* Icon/Image Placeholder - Optional, keeping it simple as per request */}

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900">Maintenance Mode</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Sorry, the course is under maintanace now. we will inform you by email as soon as it is available again
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">

                                <button
                                    onClick={() => {
                                        void trackWaitlistClick();
                                        onJoinWaitlist();
                                    }}
                                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-200 cursor-pointer"
                                >
                                    Join Waitlist
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full bg-transparent hover:bg-gray-50 text-gray-500 font-semibold py-3 rounded-full transition-all active:scale-[0.98] text-sm cursor-pointer"
                                >
                                    No thanks
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
