"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItemProps {
    question: string;
    answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10 last:border-none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left hover:text-white transition-colors"
            >
                <span className="font-medium text-gray-200">{question}</span>
                {isOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 text-gray-400 text-sm leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PurchaseFAQ() {
    const faqs = [
        {
            question: "How do I cancel my trial?",
            answer:
                "To cancel, head to your app's settings or visit your account page, sign in with your original login option, tap 'cancel your subscription', and follow the steps till confirmation.",
        },
        {
            question: "Can I use app on more than one device?",
            answer:
                "Yes! As long as you sign into the app with the same login method used to make the original purchase, you can use it on multiple devices.",
        },
        {
            question: "What is your refund policy?",
            answer:
                "You can request a refund within 14 days of the billing date. We aim to ensure your satisfaction with our products.",
        },
        {
            question: "How do I unsubscribe?",
            answer:
                "You can unsubscribe within the app settings or via our website. Simply log in, navigate to subscription settings, and choose to cancel.",
        },
    ];

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6">Frequently Asked Questions</h3>
            <div className="flex flex-col">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
            </div>
        </div>
    );
}
