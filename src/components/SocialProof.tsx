'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const stats = [
    { label: 'Satisfaction', value: '4.9/5', sub: 'from HR Managers' },
    { label: 'Learners', value: '10k+', sub: 'Upskilled' },
    { label: 'Modules', value: '500+', sub: 'Available' },
];

const testimonials = [
    {
        name: 'Alex Chen',
        role: 'Tech Lead at TechCorp',
        text: "The adaptive level system saved us hours of training time. Employees get exactly what they need.",
        image: '/avatars/tech_manager.png'
    },
    {
        name: 'Sarah Miller',
        role: 'Finance Team Lead',
        text: "My team mastered Excel Copilot in days. The hands-on labs are a game changer.",
        image: '/avatars/finance_lead.png'
    },
    {
        name: 'Sharon Cohen',
        role: 'HR Director',
        text: "The manager dashboard gives me the exact visibility I need on company-wide adoption.",
        image: '/avatars/hr_director.png'
    }
];

import { useAnimations } from '@/lib/AnimationContext';
import Image from 'next/image';

export default function SocialProof() {
    const { animationsEnabled } = useAnimations();

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4">
                {/* Stats Grid */}
                {/* Stats Grid - Hidden as per request */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 border-y border-white/10 py-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={animationsEnabled ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ delay: animationsEnabled ? i * 0.1 : 0 }}
                            className="text-center"
                        >
                            <h3 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-2">
                                {stat.value}
                            </h3>
                            <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">{stat.label}</p>
                            <p className="text-gray-600 text-xs mt-1">{stat.sub}</p>
                        </motion.div>
                    ))}
                </div> */}

                {/* Testimonials */}
                <div className="text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12">Trusted by Managers Across Industries</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, margin: "-50px" }}
                                transition={{ delay: animationsEnabled ? 0.2 + (i * 0.1) : 0 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left"
                            >
                                <div className="flex gap-1 text-yellow-500 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-gray-300 mb-6 text-sm leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                                        <Image
                                            src={t.image}
                                            alt={t.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white font-semibold text-sm">{t.name}</p>
                                        <p className="text-gray-400 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

