'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Table, Presentation, Users, Mail, Cloud, MessageSquare, Check } from 'lucide-react';
import Link from 'next/link';

export const tabs = [
    {
        id: 'word',
        label: 'Word',
        icon: FileText,
        title: 'Draft Better Documents',
        description: 'Learn how to use Copilot to draft resumes, reports, and emails instantly directly in Word.',
        color: 'from-[#1B5EBE] to-[#41A5EE]',
        baseColor: '#1B5EBE',
        customGradient: 'linear-gradient(135deg, #1B5EBE 0%, #41A5EE 100%)',
        demo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200'
    },
    {
        id: 'excel',
        label: 'Excel',
        icon: Table,
        title: 'Master Data Analysis',
        description: 'Learn how to use Copilot to generate complex formulas, budgets, and insights just by asking questions.',
        color: 'from-[#10793F] to-[#185C37]',
        baseColor: '#10793F',
        customGradient: 'linear-gradient(135deg, #185C37 0%, #10793F 100%)',
        demo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200'
    },
    {
        id: 'ppt',
        label: 'PowerPoint',
        icon: Presentation,
        title: 'Design Professional Slides',
        description: 'Learn how to use Copilot to turn your ideas into stunning presentations with AI-generated layouts.',
        color: 'from-[#C13B1B] to-[#D35230]',
        baseColor: '#C13B1B',
        customGradient: 'linear-gradient(135deg, #C13B1B 0%, #D35230 100%)',
        demo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200'
    },
    {
        id: 'teams',
        label: 'Teams',
        icon: Users,
        title: 'Streamline Collaboration',
        description: 'Learn how to use Copilot to summarize meetings, generate action items, and find information across chats.',
        color: 'from-[#464EB8] to-[#7B83EB]',
        baseColor: '#464EB8',
        customGradient: 'linear-gradient(135deg, #464EB8 0%, #7B83EB 100%)',
        demo: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200'
    },
    {
        id: 'outlook',
        label: 'Outlook',
        icon: Mail,
        title: 'Control Your Inbox',
        description: 'Learn how to use Copilot to draft replies, summarize long threads, and prioritize your most important emails.',
        color: 'from-[#0078D4] to-[#0364B8]',
        baseColor: '#0078D4',
        customGradient: 'linear-gradient(135deg, #0364B8 0%, #0078D4 100%)',
        demo: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1200'
    },
    {
        id: 'chat',
        label: 'Chat',
        icon: MessageSquare,
        title: 'Chat With Your Data',
        description: 'Learn how to use Copilot Chat to synthesize information, brainstorm ideas, and get answers from your company data.',
        color: 'from-[#44A87F] to-[#BD4FB9]',
        baseColor: '#44A87F',
        customGradient: 'linear-gradient(135deg, #44A87F 0%, #BD4FB9 100%)',
        demo: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200'
    },
    {
        id: 'onedrive',
        label: 'OneDrive',
        icon: Cloud,
        title: 'Find Files Instantly',
        description: 'Learn how to use Copilot to find any file, photo, or document instantly with intelligent natural language search.',
        color: 'from-[#28A8EA] to-[#1490DF]',
        baseColor: '#28A8EA',
        customGradient: 'linear-gradient(135deg, #1490DF 0%, #28A8EA 100%)',
        demo: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?auto=format&fit=crop&w=1200'
    }
];

import { useAnimations } from '@/lib/AnimationContext';
import { trackStartFreeTrialClick } from '@/utils/userActions';

interface HeroProps {
    initialTool?: string;
}

export default function Hero({ initialTool }: HeroProps) {
    // Find the initial tab based on the prop, or default to first tab
    const getInitialTab = () => {
        if (initialTool) {
            const found = tabs.find(t => t.id === initialTool);
            if (found) return found;
        }
        return tabs[0];
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);
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
                    {initialTool ? (
                        <>
                            Master Copilot in <br />
                            <span className="text-gradient">
                                {tabs.find(t => t.id === initialTool)?.label || 'Microsoft 365'}
                            </span>
                        </>
                    ) : (
                        <>
                            Copilot In M365 Course <br />
                            <span className="text-gradient">Personalized For You</span>
                        </>
                    )}
                </motion.h1>
                <motion.p
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 text-xl max-w-2xl mx-auto"
                >
                    {initialTool ? (
                        <>
                            {tabs.find(t => t.id === initialTool)?.description}
                            <span className="block mt-4 text-sm text-gray-500">
                                (Plus: The bundle also includes {tabs.filter(t => t.id !== initialTool).map(t => t.label).join(', ')}, and more)
                            </span>
                        </>
                    ) : (
                        'Master Copilot with expert video lessons and step-by-step, "WalkMe-style" guidance for Word, Excel, and PowerPoint.'
                    )}
                </motion.p>

                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 flex flex-col items-center gap-3"
                >
                    <Link
                        href="/login"
                        onClick={() => void trackStartFreeTrialClick(2)}
                        className="inline-block bg-white text-black font-bold py-4 px-8 rounded-full text-lg hover:scale-105 transition-transform duration-200"
                    >
                        Start Free Trial
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium opacity-80">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>No installation required</span>
                    </div>
                </motion.div>
            </div>

            {/* Tab Navigation */}
            <div id="tools" className="flex flex-col items-center gap-6 mb-12 z-10 scroll-mt-32 w-full max-w-5xl">
                {initialTool ? (
                    // Tool-Specific Layout
                    <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-center max-w-4xl mx-auto">
                        {/* Selected Tool - Big & Prominent (Left) */}
                        <div className="flex-shrink-0">
                            {(() => {
                                const tab = tabs.find(t => t.id === initialTool);
                                if (!tab) return null;
                                return (
                                    <div
                                        onClick={() => setActiveTab(tab)}
                                        className="flex items-center gap-3 px-8 py-5 rounded-2xl border transition-all duration-300 relative bg-black/40 backdrop-blur-md cursor-pointer hover:scale-105"
                                        style={{
                                            borderColor: tab.baseColor,
                                            boxShadow: `0 0 30px ${tab.baseColor}20`,
                                        }}
                                    >
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-10" style={{
                                            backgroundImage: `linear-gradient(to right, ${tab.baseColor}, transparent)`
                                        }} />
                                        <tab.icon className="w-8 h-8" style={{ color: tab.baseColor }} />
                                        <span className="text-2xl font-bold text-white tracking-tight">
                                            {tab.label}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Others Group (Right) */}
                        <div className="flex flex-col items-center md:items-start gap-2 flex-grow">
                            <div className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">
                                Also Included
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                {tabs.filter(t => t.id !== initialTool).map((tab) => {
                                    const isActive = activeTab.id === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${isActive
                                                ? 'bg-white/10 border-white/20 text-white shadow-lg'
                                                : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} style={isActive ? {} : { color: tab.baseColor }} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Default Layout (Original)
                    <div className="flex flex-wrap justify-center gap-2">
                        {tabs.map((tab) => {
                            const isActive = activeTab.id === tab.id;
                            // @ts-ignore
                            const gradientStyle = isActive && tab.customGradient ? {
                                backgroundImage: tab.customGradient,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                color: 'transparent'
                            } : {
                                color: isActive ? tab.baseColor : undefined
                            };

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab)}
                                    style={isActive ? {
                                        borderColor: tab.baseColor,
                                        backgroundColor: `${tab.baseColor}10`,
                                        boxShadow: `0 0 20px ${tab.baseColor}40`,
                                    } : {}}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${isActive
                                        ? ''
                                        : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon
                                        className="w-4 h-4"
                                        style={isActive ? { color: tab.baseColor } : {}}
                                    />
                                    <span style={gradientStyle}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
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
                                <activeTab.icon
                                    className={`w-12 h-12 mb-6`}
                                    style={{ color: activeTab.baseColor }}
                                />
                                <h3
                                    className="text-3xl font-bold mb-4 leading-tight"
                                    style={
                                        // @ts-ignore
                                        activeTab.customGradient ? {
                                            backgroundImage: activeTab.customGradient,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            color: 'transparent'
                                        } : {
                                            color: activeTab.baseColor
                                        }
                                    }
                                >
                                    {activeTab.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed mb-8">{activeTab.description}</p>
                                <Link
                                    href="/login"
                                    onClick={() => void trackStartFreeTrialClick(3)}
                                    className="text-sm font-semibold hover:text-white text-gray-400 transition-colors flex items-center gap-2"
                                >
                                    Start Free Trial <span className="text-lg">→</span>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

        </section>
    );
}
