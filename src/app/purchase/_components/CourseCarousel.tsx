"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FaArrowLeft, FaArrowRight, FaFileExcel, FaFileWord, FaFilePowerpoint, FaCommentDots, FaEnvelope } from "react-icons/fa";

interface CourseCardProps {
    title: string;
    icon: React.ReactNode;
    description: string;
}

function CourseCard({ title, icon, description }: CourseCardProps) {
    return (
        // Directly sized to 1/3 of the container. 
        // Using min-w-0 to allow text truncation/reflow if needed, though card has fixed padding.
        // Added padding inside the card wrapper to create the "gap" visually.
        <div className="flex-[0_0_33.33%] min-w-0 px-3">
            <div className="h-full p-6 pb-8 rounded-2xl bg-gradient-to-b from-[#9d8bf4] to-[#7f6df2] text-white flex flex-col items-center text-center shadow-xl select-none">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mb-4 backdrop-blur-sm mt-4">
                    {icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-sm text-purple-100 leading-relaxed font-medium px-2">{description}</p>
            </div>
        </div>
    );
}

export default function CourseCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        dragFree: true,
        containScroll: "trimSnaps",
        align: "center"
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

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

    return (
        // Background gradient: Removed 'to-white' to ensure it stays pink-ish at the bottom, 
        // creating a hard line against the white payment section.
        <section className="w-full py-20 overflow-hidden bg-gradient-to-b from-[#fdf0f6] to-[#fceefc]">
            <div className="w-full relative">
                <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-[#2D2D2D] tracking-tight">
                    What you get with Copilot Inside
                </h2>

                {/* 
            Carousel Container:
            - w-[70%] to ensure roughly 15% margins on each side.
            - px-0 because we handle padding inside the cards for gap.
        */}
                <div className="overflow-hidden w-[90%] md:w-[70%] lg:w-[60%] mx-auto cursor-grab active:cursor-grabbing" ref={emblaRef}>
                    <div className="flex">
                        {courses.map((course, index) => (
                            <CourseCard key={index} {...course} />
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows (Pill Shape) */}
                <div className="flex justify-center gap-6 mt-12">
                    <button
                        onClick={scrollPrev}
                        className="w-20 h-10 rounded-full border border-black bg-transparent hover:bg-black hover:text-white text-black flex items-center justify-center transition-all duration-300"
                        aria-label="Previous"
                    >
                        <FaArrowLeft size={16} />
                    </button>
                    <button
                        onClick={scrollNext}
                        className="w-20 h-10 rounded-full border border-black bg-transparent hover:bg-black hover:text-white text-black flex items-center justify-center transition-all duration-300"
                        aria-label="Next"
                    >
                        <FaArrowRight size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
}
