'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Navbar() {
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 20);
    });

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <motion.nav
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`fixed top-0 w-full z-50 transition-colors duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
                }`}
        >
            <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-16">
                <div className="flex items-center justify-between h-20">
                    {/* Logo - Left */}
                    <div
                        onClick={() => window.location.href = '/'}
                        className="flex-shrink-0 font-bold text-2xl tracking-tighter text-white z-10 cursor-pointer"
                    >
                        Copilot<span className="text-accent-primary">Inside</span>
                    </div>

                    {/* Links - Center */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 space-x-8 lg:space-x-10">
                        <a href="#tools" onClick={(e) => scrollToSection(e, 'tools')} className="hover:text-white text-gray-300 transition-colors text-sm lg:text-base font-medium whitespace-nowrap">M365 Tools</a>
                        <a href="#ai-coach" onClick={(e) => scrollToSection(e, 'ai-coach')} className="hover:text-white text-gray-300 transition-colors text-sm lg:text-base font-medium whitespace-nowrap">AI Coach</a>
                        <a href="#my-path" onClick={(e) => scrollToSection(e, 'my-path')} className="hover:text-white text-gray-300 transition-colors text-sm lg:text-base font-medium whitespace-nowrap">My Path</a>
                        <a href="#walkthrough" onClick={(e) => scrollToSection(e, 'walkthrough')} className="hover:text-white text-gray-300 transition-colors text-sm lg:text-base font-medium whitespace-nowrap">Walkthrough</a>
                        <a href="#handson-practice" onClick={(e) => scrollToSection(e, 'handson-practice')} className="hover:text-white text-gray-300 transition-colors text-sm lg:text-base font-medium whitespace-nowrap">HandsOn Practice</a>
                    </div>

                    {/* CTA - Right */}
                    <div className="flex-shrink-0 z-10">
                        <a href="/login" className="bg-transparent border-2 border-accent-primary text-white text-base font-bold py-3 px-8 rounded-full hover:bg-accent-primary/20 hover:scale-105 transition-all duration-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                            Start free trial
                        </a>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
