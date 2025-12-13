"use client";

import { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaFileExcel, FaFileWord, FaFilePowerpoint, FaCommentDots, FaEnvelope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface CourseCardProps {
    title: string;
    icon: React.ReactNode;
    description: string;
}

function CourseCard({ title, icon, description }: CourseCardProps) {
    return (
        <div className="w-full h-full p-6 pb-8 rounded-2xl bg-gradient-to-b from-[#9d8bf4] to-[#7f6df2] text-white flex flex-col items-center text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mb-4 backdrop-blur-sm mt-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm text-purple-100 leading-relaxed font-medium px-2">{description}</p>
        </div>
    );
}

export default function CourseCarousel() {
    const [startIndex, setStartIndex] = useState(0);

    const courses = [
        {
            title: "Copilot in Excel",
            icon: <FaFileExcel />,
            description: "Master data analysis, formula generation, and complex visualization.",
        },
        {
            title: "Copilot in Word",
            icon: <FaFileWord />,
            description: "Draft documents, summarize articles, and refine your writing style.",
        },
        {
            title: "Copilot Chat",
            icon: <FaCommentDots />,
            description: "Learn effective prompting for research and daily task automation.",
        },
        {
            title: "Copilot in PowerPoint",
            icon: <FaFilePowerpoint />,
            description: "Create stunning presentations and summaries in seconds.",
        },
        {
            title: "Copilot in Outlook",
            icon: <FaEnvelope />,
            description: "Manage your inbox, summarize threads, and draft emails faster.",
        },
    ];

    const next = () => {
        setStartIndex((prev) => (prev + 1) % courses.length);
    };

    const prev = () => {
        setStartIndex((prev) => (prev - 1 + courses.length) % courses.length);
    };

    const visibleCourses = [
        courses[startIndex],
        courses[(startIndex + 1) % courses.length],
        courses[(startIndex + 2) % courses.length],
    ];

    return (
        <section className="w-full py-16 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-[#F3EEFF] to-white">
            <div className="max-w-6xl mx-auto px-4 relative">
                <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-[#2D2D2D] tracking-tight">
                    What you get with Copilot Course
                </h2>

                {/* Carousel Container */}
                <div className="relative max-w-5xl mx-auto mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {visibleCourses.map((course, i) => (
                                <motion.div
                                    key={`${course.title}-${i}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    layout
                                >
                                    <CourseCard {...course} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation Arrows (Bottom) */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={prev}
                        className="w-12 h-12 rounded-full bg-white text-gray-800 shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
                        aria-label="Previous"
                    >
                        <FaChevronLeft size={18} />
                    </button>
                    <button
                        onClick={next}
                        className="w-12 h-12 rounded-full bg-white text-gray-800 shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
                        aria-label="Next"
                    >
                        <FaChevronRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
}
