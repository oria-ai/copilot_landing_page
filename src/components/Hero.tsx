'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Table, Presentation, Users, Mail, Cloud, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const tabs = [
    {
        id: 'word',
        label: 'Word',
        icon: FileText,
        title: 'Draft Better Documents',
        description: 'Learn how to use Copilot to draft resumes, reports, and emails instantly directly in Word.',
        color: 'from-blue-500 to-cyan-500',
        demo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200'
    },
    {
        id: 'excel',
        label: 'Excel',
        icon: Table,
        title: 'Master Data Analysis',
        description: 'Learn how to use Copilot to generate complex formulas, budgets, and insights just by asking questions.',
        color: 'from-green-500 to-emerald-500',
        demo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200'
    },
    {
        id: 'ppt',
        label: 'PowerPoint',
        icon: Presentation,
        title: 'Design Professional Slides',
        description: 'Learn how to use Copilot to turn your ideas into stunning presentations with AI-generated layouts.',
        color: 'from-orange-500 to-red-500',
        demo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200'
    },
    {
        id: 'teams',
        label: 'Teams',
        icon: Users,
        title: 'Streamline Collaboration',
        description: 'Learn how to use Copilot to summarize meetings, generate action items, and find information across chats.',
        color: 'from-indigo-500 to-purple-500',
        demo: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200'
    },
    {
        id: 'outlook',
        label: 'Outlook',
        icon: Mail,
        title: 'Control Your Inbox',
        description: 'Learn how to use Copilot to draft replies, summarize long threads, and prioritize your most important emails.',
        color: 'from-blue-400 to-blue-600',
        demo: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1200'
    },
    {
        id: 'chat',
        label: 'Chat',
        icon: MessageSquare,
        title: 'Chat With Your Data',
        description: 'Learn how to use Copilot Chat to synthesize information, brainstorm ideas, and get answers from your company data.',
        color: 'from-purple-500 to-pink-500',
        demo: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200'
    },
    {
        id: 'onedrive',
        label: 'OneDrive',
        icon: Cloud,
        title: 'Find Files Instantly',
        description: 'Learn how to use Copilot to find any file, photo, or document instantly with intelligent natural language search.',
        color: 'from-sky-400 to-blue-500',
        demo: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?auto=format&fit=crop&w=1200'
    }
];

import { useAnimations } from '@/lib/AnimationContext';

export default function Hero() {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [autoPlay, setAutoPlay] = useState(true);
    const { animationsEnabled } = useAnimations();

    useEffect(() => {
        // Stop auto-play if animations are globally disabled
        if (!animationsEnabled) {
            setAutoPlay(false);
        }
    }, [animationsEnabled]);

    useEffect(() => {
        if (!autoPlay || !animationsEnabled) return;
        const interval = setInterval(() => {
            const currentIndex = tabs.findIndex(t => t.id === activeTab.id);
            const nextIndex = (currentIndex + 1) % tabs.length;
            setActiveTab(tabs[nextIndex]);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeTab, autoPlay, animationsEnabled]);

    return (
        <section className="relative min-h-screen pt-32 pb-20 px-4 overflow-hidden flex flex-col items-center">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-soft opacity-50 blur-3xl pointer-events-none" />

            {/* Header Content */}
            <div className="text-center max-w-4xl mx-auto z-10 mb-12">
                <motion.h1
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                >
                    Your Personalized <br />
                    <span className="text-gradient">M365 Training Program</span>
                </motion.h1>
                <motion.p
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 text-xl max-w-2xl mx-auto"
                >
                    Master Copilot with expert video lessons and step-by-step, "WalkMe-style" guidance inside Word, Excel, and PowerPoint.
                </motion.p>

                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8"
                >
                    <Link href="/login" className="inline-block bg-white text-black font-bold py-4 px-8 rounded-full text-lg hover:scale-105 transition-transform duration-200">
                        Start Free Trial
                    </Link>
                </motion.div>
            </div>

            {/* Tab Navigation */}
            <div id="tools" className="flex flex-wrap justify-center gap-2 mb-12 z-10 scroll-mt-32">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab);
                            setAutoPlay(false);
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${activeTab.id === tab.id
                            ? 'bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                            : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Dynamic Content Display */}
            <div className="relative w-full max-w-6xl aspect-[16/9] md:aspect-[21/9] bg-gray-900/50 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm z-10">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab.id}
                        initial={animationsEnabled ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={animationsEnabled ? { opacity: 0, scale: 1.05 } : { opacity: 0, scale: 1 }}
                        transition={{ duration: animationsEnabled ? 0.5 : 0 }}
                        className="absolute inset-0 flex flex-col md:flex-row"
                    >
                        {/* Image/Demo Side */}
                        <div className="w-full md:w-2/3 h-full relative overflow-hidden group">
                            {/* Overlay Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-tr ${activeTab.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                            <img
                                src={activeTab.demo}
                                alt={activeTab.label}
                                className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-50" />
                        </div>

                        {/* Text Side */}
                        <div className="w-full md:w-1/3 p-8 md:p-12 flex flex-col justify-center bg-black/40 backdrop-blur-md border-l border-white/5">
                            <motion.div
                                initial={animationsEnabled ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <activeTab.icon className={`w-12 h-12 mb-6 text-white opacity-80`} />
                                <h3 className="text-3xl font-bold mb-4 leading-tight">{activeTab.title}</h3>
                                <p className="text-gray-400 leading-relaxed mb-8">{activeTab.description}</p>
                                <a href="#" className="text-sm font-semibold hover:text-white text-gray-400 transition-colors flex items-center gap-2">
                                    See course details <span className="text-lg">→</span>
                                </a>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

        </section>
    );
}
