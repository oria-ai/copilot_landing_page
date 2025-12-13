'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import AiCoachingVideo from './AiCoachingVideo';

const values = [
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
        type: 'video',
        align: 'left'
    },
    {
        id: 'my-path',
        title: 'Role-Specific Paths',
        description: 'Curated learning paths for Finance, HR, and Marketing. Learn exactly what you need for your job, skipping irrelevant content.',
        src: '/path.mp4',
        type: 'video',
        align: 'right'
    },
    {
        id: 'walkthrough',
        title: 'Interactive Walkthrough Guidance',
        description: 'Go beyond passive watching. After every video lesson, reinforce your skills with our overlay technology that guides your clicks in real-time.',
        src: '/orientation.mp4',
        type: 'video',
        align: 'left'
    },
    {
        id: 'handson-practice',
        title: 'Hands-On Practice',
        description: 'your skills in real-world scenarios, practicing directly in your real work environment - using the same tools, files, and workflows you use every day.',
        image: '/artifacts/manager_analytics_dashboard_1765320102691.png', // Reusing dashboard image for now as "Grading" visual
        align: 'right'
    }
];

import { useAnimations } from '@/lib/AnimationContext';

export default function ValueSections() {
    const { animationsEnabled } = useAnimations();

    return (
        <section className="bg-black py-24 space-y-32">
            {values.map((value, i) => (
                <div key={i} id={value.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
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
                            <Link href="/login" className="inline-block bg-white text-black font-bold py-4 px-8 rounded-full text-lg hover:scale-105 transition-transform duration-200">
                                Start Free Trial
                            </Link>
                        </motion.div>

                        {/* Image Side */}
                        <motion.div
                            initial={animationsEnabled ? { opacity: 0, scale: 0.9, y: 50 } : { opacity: 1, scale: 1, y: 0 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: false, margin: "-100px" }}
                            transition={{ duration: animationsEnabled ? 0.8 : 0 }}
                            className="flex-1 w-full"
                        >
                            <div className={`relative ${value.type === 'video' ? 'aspect-video' : 'aspect-[4/3]'} rounded-3xl overflow-hidden border border-white/10 group`}>
                                {value.type !== 'video' && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/20 to-accent-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                )}
                                {value.type === 'video' ? (
                                    <AiCoachingVideo
                                        src={value.src || ''}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <img
                                        src={value.image}
                                        alt={value.title}
                                        className="object-cover w-full h-full"
                                    />
                                )}
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
