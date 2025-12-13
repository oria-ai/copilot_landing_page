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
        <div className="border-b border-gray-300 last:border-none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left hover:text-purple-700 transition-colors"
            >
                <span className="font-bold text-gray-800 text-base md:text-lg">{question}</span>
                {isOpen ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
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
                        <p className="pb-4 text-gray-600 leading-relaxed font-medium text-sm md:text-base">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PurchaseFAQ() {
    const scrollToPayment = () => {
        const paymentSection = document.getElementById("payment-section");
        if (paymentSection) {
            paymentSection.scrollIntoView({ behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const faqs = [
        {
            question: "Is this course suitable for beginners?",
            answer:
                "Absolutely! We start with the basics of Copilot before moving to advanced workflows. No prior AI experience is needed.",
        },
        {
            question: "Do I need an active Microsoft 365 subscription?",
            answer:
                "Yes, to follow along with the practical exercises in Word, Excel, and PowerPoint, you will need an active M365 Business or Enterprise license with Copilot.",
        },
        {
            question: "How long does it take to complete the course?",
            answer:
                "The course is self-paced. Most students complete the core modules in about 3-4 weeks, dedicating 2-3 hours per week.",
        },
        {
            question: "Will I receive a certificate upon completion?",
            answer:
                "Yes! Upon finishing all modules and the final project, you'll receive a verified certificate to showcase your new AI skills on LinkedIn.",
        },
    ];

    return (
        <div className="bg-[#F9F8FD] w-full py-16">
            <div className="max-w-2xl mx-auto px-4">
                <h3 className="text-3xl font-black text-center mb-10 text-gray-900">FAQ</h3>
                <div className="flex flex-col mb-12">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={scrollToPayment}
                        className="cursor-pointer bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        Start Free Trial
                    </button>
                </div>
            </div>
        </div>
    );
}
