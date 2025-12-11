'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const values = [
    {
        id: 'ai-coach',
        title: 'Personalized AI Coaching',
        description: 'Your personal tutor that adapts to your pace. Get instant feedback as you work, ensuring you master every concept before moving on.',
        image: '/artifacts/adaptive_learning_flow_1765320088222.png',
        align: 'left'
    },
    {
        id: 'my-path',
        title: 'Role-Specific Paths',
        description: 'Curated learning paths for Finance, HR, and Marketing. Learn exactly what you need for your job, skipping irrelevant content.',
        image: '/artifacts/role_specific_ui_1765320138921.png',
        align: 'right'
    },
    {
        id: 'walkthrough',
        title: 'Interactive Walkthrough Guidance',
        description: 'Go beyond passive watching. After every video lesson, reinforce your skills with our overlay technology that guides your clicks in real-time.',
        image: '/artifacts/hands_on_lab_1765320152433.png',
        align: 'left'
    },
    {
        id: 'handson-practice',
        title: 'Interactive Challenges',
        description: 'Test your skills with real-world scenarios. Solve problems in a safe, simulated environment and get graded by AI instantly.',
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
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/20 to-accent-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                <img
                                    src={value.image}
                                    alt={value.title}
                                    className="object-cover w-full h-full"
                                />
                                {/* Glass overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                            </div>
                        </motion.div>

                    </div>
                </div>
            ))}
        </section>
    );
}
