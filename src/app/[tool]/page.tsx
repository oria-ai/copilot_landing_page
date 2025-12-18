import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Hero, { tabs } from '@/components/Hero';
import ValueSections from '@/components/ValueSections';
import SocialProof from '@/components/SocialProof';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

// Map URL slugs to tab IDs (for user-friendly URLs)
const slugToTabId: Record<string, string> = {
    'word': 'word',
    'excel': 'excel',
    'powerpoint': 'ppt',
    'ppt': 'ppt',
    'teams': 'teams',
    'outlook': 'outlook',
    'chat': 'chat',
    'onedrive': 'onedrive',
};

// Generate static params for all valid tools
export function generateStaticParams() {
    return Object.keys(slugToTabId).map((tool) => ({
        tool,
    }));
}

interface ToolPageProps {
    params: Promise<{ tool: string }>;
}

export default async function ToolPage({ params }: ToolPageProps) {
    const { tool } = await params;
    const tabId = slugToTabId[tool.toLowerCase()];

    // Redirect to home if invalid tool
    if (!tabId) {
        redirect('/');
    }

    // Verify the tab actually exists
    const tabExists = tabs.some(t => t.id === tabId);
    if (!tabExists) {
        redirect('/');
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans">
            <ScrollToTop />
            <Navbar />
            <Hero initialTool={tabId} />
            <ValueSections />
            <SocialProof />
            <Footer />
        </main>
    );
}
