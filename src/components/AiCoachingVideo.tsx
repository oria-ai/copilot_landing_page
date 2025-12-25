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
                    const video = videoRef.current;
                    if (!video) return;

                    // If completely out of view
                    if (!entry.isIntersecting) {
                        video.pause();
                        video.currentTime = 0;
                    }
                    // If visible but less than 50%
                    else if (entry.intersectionRatio < 0.5) {
                        video.pause();
                    }
                    // If visible >= 50%
                    else {
                        video.play().catch((error) => {
                            console.error("Autoplay prevented:", error);
                        });
                    }
                });
            },
            {
                threshold: [0, 0.5], // Trigger at 0% and 50% visibility
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
