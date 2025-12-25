'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAnimations } from '@/lib/AnimationContext';
import AiCoachingVideo from './AiCoachingVideo';
import { trackStartFreeTrialClick } from '@/utils/userActions';
import { Check } from 'lucide-react';

type ValueItem = {
    id: string;
    title: string;
    description: ReactNode;
    src: string;
    align: 'left' | 'right';
};

const values: ValueItem[] = [
    {
        id: 'ai-coach',
        title: 'Personalized AI Coaching',
        description: (
            <>
                Your personal tutor that adapts to your pace.<br />
                Get instant feedback as you work, ensuring<br />
                you master every concept before moving on.
            </>
        ),
        src: '/ai_feedback.mp4',
        align: 'left'
    },
    {
        id: 'my-path',
        title: 'Role-Specific Paths',
        description: 'Curated learning paths for Finance, HR, and Marketing. Learn exactly what you need for your job, skipping irrelevant content.',
        src: '/path.mp4',
        align: 'right'
    },
    {
        id: 'walkthrough',
        title: 'Interactive Walkthrough Guidance',
        description: 'Go beyond passive watching. After every video lesson, reinforce your skills with our interactive browser-based Walkthrough.',
        src: '/orientation.mp4',
        align: 'left'
    },
    {
        id: 'handson-practice',
        title: 'Hands-On Practice',
        description: 'your skills in real-world scenarios, practicing directly in your real work environment - using the same tools, files, and workflows you use every day.',
        src: '/practice.mp4',
        align: 'right'
    }
];

export default function ValueSections() {
    const { animationsEnabled } = useAnimations();

    return (
        <section className="bg-black py-24 space-y-32">
            {values.map((value, index) => (
                <div key={value.id} id={value.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
                    <div className={`flex flex-col ${value.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}>

                        {/* Text Side */}
                        <motion.div
                            initial={animationsEnabled ? { opacity: 0, x: value.align === 'left' ? -50 : 50 } : { opacity: 1, x: 0 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, margin: "-100px" }}
                            transition={{ duration: animationsEnabled ? 0.8 : 0 }}
                            className="flex-1 space-y-8"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                {value.title}
                            </h2>
                            <p className="text-xl text-gray-400 leading-relaxed">
                                {value.description}
                            </p>
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/login"
                                    onClick={() => void trackStartFreeTrialClick(4 + index)}
                                    className="inline-block bg-white text-black font-bold py-4 px-8 rounded-full text-lg hover:scale-105 transition-transform duration-200 text-center w-fit"
                                >
                                    {index % 2 === 1 ? 'Get Started' : 'Start Free Trial'}
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-gray-400 font-medium opacity-80 pl-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>No installation required</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Video Side */}
                        <motion.div
                            initial={animationsEnabled ? { opacity: 0, scale: 0.9, y: 50 } : { opacity: 1, scale: 1, y: 0 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: false, margin: "-100px" }}
                            transition={{ duration: animationsEnabled ? 0.8 : 0 }}
                            className="flex-1 w-full"
                        >
                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10">
                                <AiCoachingVideo src={value.src} className="w-full h-full" />
                                {/* Glass overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                            </div>
                        </motion.div>

                    </div>
                </div>
            ))}
        </section>
    );
}
