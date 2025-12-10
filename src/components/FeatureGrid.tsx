'use client';

import { motion } from 'framer-motion';
import {
    Wand2, Scissors, UserSquare2, Zap, ImagePlus,
    Video, Eraser, Layers, Palette, Crop
} from 'lucide-react';

const features = [
    {
        title: 'AI Image to Video',
        description: 'Transform static photos into mesmerizing videos instantly.',
        icon: Video,
        span: 'md:col-span-2 md:row-span-2',
        color: 'from-purple-500/20 to-indigo-500/20',
        border: 'group-hover:border-indigo-500/50'
    },
    {
        title: 'Magic Eraser',
        description: 'Remove unwanted objects or people with a single tap.',
        icon: Eraser,
        span: 'md:col-span-1 md:row-span-1',
        color: 'from-pink-500/20 to-rose-500/20',
        border: 'group-hover:border-rose-500/50'
    },
    {
        title: 'Background Remover',
        description: 'Swap backgrounds instantly using smart AI detection.',
        icon: Scissors,
        span: 'md:col-span-1 md:row-span-1',
        color: 'from-cyan-500/20 to-blue-500/20',
        border: 'group-hover:border-cyan-500/50'
    },
    {
        title: 'AI Avatars',
        description: 'Generate stunning digital personas in various art styles.',
        icon: UserSquare2,
        span: 'md:col-span-1 md:row-span-2',
        color: 'from-yellow-500/20 to-orange-500/20',
        border: 'group-hover:border-orange-500/50'
    },
    {
        title: 'Photo Enhancer',
        description: 'Restore old blurry photos into high-def masterpieces.',
        icon: Zap,
        span: 'md:col-span-1 md:row-span-1',
        color: 'from-emerald-500/20 to-green-500/20',
        border: 'group-hover:border-emerald-500/50'
    },
    {
        title: 'Stickers & Collage',
        description: 'Get creative with thousands of assets and layouts.',
        icon: Layers,
        span: 'md:col-span-1 md:row-span-1',
        color: 'from-fuchsia-500/20 to-purple-500/20',
        border: 'group-hover:border-fuchsia-500/50'
    },
];

export default function FeatureGrid() {
    return (
        <section className="py-24 px-4 bg-black">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        You won't believe what you can <br />
                        <span className="text-gradient">create on your phone</span>
                    </h2>
                    <p className="text-gray-400">Everything you need to edit, create, and design.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`group relative p-8 rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition-colors duration-300 ${feature.span} ${feature.border}`}
                        >
                            {/* Hover Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="p-3 bg-white/10 w-fit rounded-xl backdrop-blur-md">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
