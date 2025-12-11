"use client";

import { useRef, useEffect } from "react";

interface AiCoachingVideoProps {
    src: string;
    className?: string; // Container class
}

export default function AiCoachingVideo({ src, className }: AiCoachingVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch((error) => {
                            console.error("Autoplay prevented:", error);
                        });
                    } else {
                        videoRef.current?.pause();
                    }
                });
            },
            {
                threshold: 0.5, // Trigger when 50% of the video is visible
            }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    return (
        <div className={className || "w-full max-w-4xl mx-auto my-8 rounded-xl overflow-hidden shadow-2xl"}>
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover" // Changed to match typical container-fill behavior
                loop
                muted
                playsInline
            />
        </div>
    );
}
