'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AnimationContextType {
    animationsEnabled: boolean;
}

const AnimationContext = createContext<AnimationContextType>({ animationsEnabled: true });

export function useAnimations() {
    return useContext(AnimationContext);
}

export function AnimationProvider({ children }: { children: ReactNode }) {
    const [animationsEnabled, setAnimationsEnabled] = useState(true);

    useEffect(() => {
        // Check for reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (mediaQuery.matches) {
            setAnimationsEnabled(false);
            return;
        }

        mediaQuery.addEventListener('change', (e) => {
            setAnimationsEnabled(!e.matches);
        });

        // Function to check if UserWay has paused animations
        const checkUserWayState = () => {
            // UserWay adds various attributes and classes when features are enabled
            const html = document.documentElement;
            const body = document.body;

            // Check for common UserWay animation pause indicators
            const isPaused =
                html.hasAttribute('data-uwy-sa') || // Stop animations attribute
                body.hasAttribute('data-uwy-sa') ||
                html.classList.contains('uwy-animations-paused') ||
                body.classList.contains('uwy-animations-paused') ||
                html.getAttribute('data-userway-s') === 'on' ||
                // Check computed style for animation-play-state
                getComputedStyle(body).animationPlayState === 'paused' ||
                // Check for any data-uwy attribute that might indicate pause
                Array.from(html.attributes).some(attr =>
                    attr.name.startsWith('data-uwy') && attr.value.includes('animation')
                );

            setAnimationsEnabled(!isPaused);
        };

        // Initial check
        checkUserWayState();

        // Use MutationObserver to detect UserWay changes
        const observer = new MutationObserver(() => {
            checkUserWayState();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'style', 'data-uwy-sa', 'data-userway-s']
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class', 'style', 'data-uwy-sa', 'data-userway-s']
        });

        // Also poll periodically as a fallback (UserWay may use inline styles)
        const pollInterval = setInterval(checkUserWayState, 500);

        // Listen for UserWay events
        const handleUserWayEvent = () => {
            setTimeout(checkUserWayState, 100);
        };

        document.addEventListener('userway:render_completed', handleUserWayEvent);

        return () => {
            mediaQuery.removeEventListener('change', () => { });
            observer.disconnect();
            clearInterval(pollInterval);
            document.removeEventListener('userway:render_completed', handleUserWayEvent);
        };
    }, []);

    return (
        <AnimationContext.Provider value={{ animationsEnabled }}>
            {children}
        </AnimationContext.Provider>
    );
}
